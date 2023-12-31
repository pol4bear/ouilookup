#!/usr/bin/env python3

import click
import json
import logging
import os
import pandas as pd
import requests
from calendar import timegm
from datetime import datetime
from flask import Flask, request, send_from_directory
from io import StringIO
from pathlib import Path
from threading import Timer

logging.basicConfig(level=logging.INFO)
db_update_interval = 604800
mal_db_url = 'https://standards-oui.ieee.org/oui/oui.csv'
mam_db_url = 'https://standards-oui.ieee.org/oui28/mam.csv'
mas_db_url = 'https://standards-oui.ieee.org/oui36/oui36.csv'

working_dir = Path(__file__).parent.resolve()
data_dir = working_dir / 'data'
init_timer = None
is_initializing = False
mal_db = None
mam_db = None
mas_db = None
app = Flask(__name__)


def init():
  global is_initializing, init_timer, mal_db, mam_db, mas_db
  is_initializing = True
  logging.info('Initializing the server')
  if not data_dir.is_dir():
    os.mkdir(data_dir)

  update_db = True
  mal_file = data_dir / 'mal.csv'
  mam_file = data_dir / 'mam.csv'
  mas_file = data_dir / 'mas.csv'
  current_time = datetime.utcnow()
  last_update =  data_dir / 'last_update.txt'
  elapsed_time = 0
  if last_update.is_file():
    try:
      timestamp = datetime.utcfromtimestamp(int(last_update.read_text()))
      logging.debug(f'Last OUI DB update time is {timestamp}')
      elapsed_time = (current_time - timestamp).seconds
      if mal_file.exists() and mam_file.exists() and mas_file.exists() and elapsed_time < db_update_interval:
        update_db = False
    except:
      os.remove(last_update)

  if update_db:
    logging.debug('Updating and loading OUI DB')
    last_update.write_text(str(timegm(current_time.utctimetuple())))
    logging.debug('Downloading MA-L DB')
    mal_db = pd.read_csv(StringIO(requests.get(mal_db_url).text)).sort_values('Assignment').reset_index(drop=True)
    mal_db.to_csv(mal_file, index=False)
    logging.debug(f'Successfully saved MA-L DB to {mal_file.absolute()}')
    logging.debug('Downloading MA-M DB')
    mam_db = pd.read_csv(StringIO(requests.get(mam_db_url).text)).sort_values('Assignment').reset_index(drop=True)
    mam_db.to_csv(mam_file, index=False)
    logging.debug(f'Successfully saved MA-M DB to {mam_file.absolute()}')
    logging.debug('Downloading MA-S DB')
    mas_db = pd.read_csv(StringIO(requests.get(mas_db_url).text)).sort_values('Assignment').reset_index(drop=True)
    mas_db.to_csv(mas_file, index=False)
    logging.debug(f'Successfully saved MA-S DB to {mas_file.absolute()}')
  else:
    logging.debug('Loading OUI DB')
    mal_db = pd.read_csv(mal_file)
    mam_db = pd.read_csv(mam_file)
    mas_db = pd.read_csv(mas_file)

  logging.info('Successfully initialized the server')
  init_timer = Timer(db_update_interval - elapsed_time, init)
  init_timer.start()
  is_initializing = False


def is_hex(input: str):
  if len(input) < 1:
    return False
  for c in input:
    if not (c.isdigit() or ('A' <= c <= 'F') or ('a' <= c <= 'f')):
      return False
  return True

def get_mac(input: str):
  if len(input) < 1:
    return None
  mac = input.replace(':', '').replace('-', '').upper()
  if len(mac) > 12:
    return None
  if not is_hex(mac):
    return None
  return mac

def search_mac(query):
  res_data = { 'count': 0 }
  if 6 <= len(query) <= 17:
    mac = get_mac(query)
    if mac == None:
      raise
    mac_len = len(mac)

    search_result = mal_db[mal_db['Assignment'].str.startswith(mac[:6])]

    result_count = len(search_result.index)
    if result_count < 1 or search_result['Organization Name'].iloc[0] == 'IEEE Registration Authority':
      search_result = []
      search_result.append(mam_db[mam_db['Assignment'].str.startswith(mac[:mac_len if mac_len < 7 else 7])])
      search_result.append(mas_db[mas_db['Assignment'].str.startswith(mac[:mac_len if mac_len < 9 else 9])])
      search_result = pd.concat(search_result, axis=0, ignore_index=True)
      result_count = len(search_result.index)

    if result_count < 1:
      if mac[1] in ('2', '6', 'A', 'E'):
        res_data['info'] = 'The address is randomly generated'
      else:
        res_data['info'] = "There's no OUI information starting with given MAC address"
    else:
      res_data['count'] = result_count
      res_data['data'] = search_result.to_dict('records')
  else:
    raise
  return res_data

def search_organization_name(query):
  res_data = { 'count': 0 }
  search_result = []
  search_result.append(mal_db[mal_db['Organization Name'].str.contains(query, False)])
  search_result.append(mam_db[mam_db['Organization Name'].str.contains(query, False)])
  search_result.append(mas_db[mas_db['Organization Name'].str.contains(query, False)])
  search_result = pd.concat(search_result, axis=0, ignore_index=True)
  result_count = len(search_result.index)

  if result_count < 1:
    res_data['info'] = "There's no OUI information with given organization name"
  else:
    res_data['count'] = result_count
    res_data['data'] = search_result.to_dict('records')

  return res_data

def search_oui_info(query):
  try:
    return search_mac(query)
  except:
    return search_organization_name(query)


@app.route('/<argument>')
def get_oui_info(argument):
  global is_initializing

  if is_initializing:
    return '', 503

  res_data = search_oui_info(argument)
  res_code = 200
  res_header = {'Content-Type': 'application/json; charset=utf-8'}

  indent = request.args.get('indent')
  if indent == None or not indent.isdigit():
    indent = 2
  res_data = json.dumps(res_data, indent=int(indent)) if request.args.get('minify') == None else json.dumps(res_data, separators=(',', ':'))

  return res_data, res_code, res_header

@app.route('/favicon.ico')
def get_favicon():
  return send_from_directory('static', 'favicon.ico')


@click.command()
@click.option('--verbose', '-v', is_flag=True, default=False, help='Get detailed log including debug messages')
@click.option('--host', '-l', default='0.0.0.0', help='Host of the web server')
@click.option('--port', '-p', default=80, help='Port of the HTTP server')
def main(verbose, host, port):
  global init_timer
  if verbose:
    logging.getLogger().setLevel(logging.DEBUG)
  init()
  app.run(host=host, port=port)
  init_timer.cancel()

if __name__ == "__main__":
  main()
500

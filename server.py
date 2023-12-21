#!/usr/bin/env python3

import click
import json
import logging
import os
import pandas as pd
import requests
from calendar import timegm
from datetime import datetime
from flask import Flask, request
from io import StringIO
from pathlib import Path
from threading import Timer

logging.basicConfig(level=logging.INFO)
db_update_interval = 604800
mal_db_url = 'https://standards-oui.ieee.org/oui/oui.csv'
mam_db_url = 'https://standards-oui.ieee.org/oui28/mam.csv'
mas_db_url = 'https://standards-oui.ieee.org/oui36/oui36.csv'
oui_len = {
  'MA-L': 6,
  'MA-M': 7,
  'MA-S': 9
}

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
  if last_update.is_file():
    try:
      timestamp = datetime.utcfromtimestamp(int(last_update.read_text()))
      logging.debug(f'Last OUI DB update time is {timestamp}')
      if mal_file.exists() and mam_file.exists() and mas_file.exists() and (current_time - timestamp).seconds < db_update_interval:
        update_db = False
    except:
      os.remove(last_update)

  if update_db:
    logging.debug('Updating and loading OUI DB')
    last_update.write_text(str(timegm(current_time.utctimetuple())))
    logging.debug('Downloading MA-L DB')
    mal_db = pd.read_csv(StringIO(requests.get(mal_db_url).text)).sort_values('Assignment').reset_index(drop=True)
    mal_db.to_csv(mal_file)
    logging.debug(f'Successfully saved MA-L DB to {mal_file.absolute()}')
    logging.debug('Downloading MA-M DB')
    mam_db = pd.read_csv(StringIO(requests.get(mam_db_url).text)).sort_values('Assignment').reset_index(drop=True)
    mam_db.to_csv(mam_file)
    logging.debug(f'Successfully saved MA-M DB to {mam_file.absolute()}')
    logging.debug('Downloading MA-S DB')
    mas_db = pd.read_csv(StringIO(requests.get(mas_db_url).text)).sort_values('Assignment').reset_index(drop=True)
    mas_db.to_csv(mas_file)
    logging.debug(f'Successfully saved MA-S DB to {mas_file.absolute()}')
  else:
    logging.debug('Loading OUI DB')
    mal_db = pd.read_csv(mal_file)
    mam_db = pd.read_csv(mam_file)
    mas_db = pd.read_csv(mas_file)

  logging.info('Successfully initialized the server')
  init_timer = Timer(db_update_interval, init)
  init_timer.start()
  is_initializing = False

@app.route('/<argument>')
def get_oui_info(argument):
  global is_initializing, oui_informations, oui_len

  if is_initializing:
    return '', 503

  res_data = { 'count': 0 }
  res_code = 200
  http_header = {'Content-Type': 'application/json; charset=utf-8'}

  try:
    if 6 <= len(argument) <= 17:
      mac = argument.replace(':', '').upper()
      mac = mac.replace('-', '')
      mac_len = len(mac)
      if mac_len > 12:
        raise

      for c in mac:
        if not (c.isdigit() or ('A' <= c <= 'F')):
          raise

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
          res_data['info'] = "There's no OUI information starting with given address"
          res_code = 204
      else:
        res_data['count'] = result_count
        res_data['data'] = search_result.to_dict('records')

  except:
    res_data['info'] = 'Non MAC address data not accepted.'
    res_code = 400

  return json.dumps(res_data, indent=2 if request.args.get('minify') == None else 0), res_code, http_header

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

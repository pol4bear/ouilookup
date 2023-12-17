#!/usr/bin/env python3

import click
import logging
import os
import pandas as pd
import requests
from pathlib import Path
from datetime import datetime
from calendar import timegm
from io import StringIO

logging.basicConfig(level=logging.INFO)
db_update_interval = 604800
mal_db_url = 'https://standards-oui.ieee.org/oui/oui.csv'
mam_db_url = 'https://standards-oui.ieee.org/oui28/mam.csv'
mas_db_url = 'https://standards-oui.ieee.org/oui36/oui36.csv'

working_dir = Path(__file__).parent.resolve()
data_dir = working_dir / 'data'
oui_informations = None

def init():
  logging.info('Initializing the server')
  if not data_dir.is_dir():
    os.mkdir(data_dir)

  update_db = True
  db_file = data_dir / 'oui.csv'
  current_time = datetime.utcnow()
  last_update =  data_dir / 'last_update.txt'
  if last_update.is_file():
    try:
      timestamp = datetime.utcfromtimestamp(int(last_update.read_text()))
      logging.debug(f'Last OUI DB update time is {timestamp}')
      if db_file.exists() and (current_time - timestamp).seconds < db_update_interval:
        update_db = False
    except:
      os.remove(last_update)

  if update_db:
    logging.debug('Updating and loading OUI DB')
    last_update.write_text(str(timegm(current_time.utctimetuple())))
    data = []
    logging.debug('Downloading MA-L DB')
    data.append(pd.read_csv(StringIO(requests.get(mal_db_url).text)))
    logging.debug('Downloading MA-M DB')
    data.append(pd.read_csv(StringIO(requests.get(mam_db_url).text)))
    logging.debug('Downloading MA-S DB')
    data.append(pd.read_csv(StringIO(requests.get(mas_db_url).text)))
    oui_informations = pd.concat(data, axis=0, ignore_index=True)
    oui_informations.to_csv(db_file)
    logging.debug(f'Successfully saved OUI DB to {db_file.absolute()}')
  else:
    logging.debug('Loading OUI DB')
    oui_informations = pd.read_csv(db_file)

  logging.info('Successfully initialized the server')


@click.command()
@click.option('--verbose', '-v', is_flag=True, default=False, help='Get detailed log including debug messages')
def main(verbose):
  if verbose:
    logging.getLogger().setLevel(logging.DEBUG)
  init()

if __name__ == "__main__":
  main()

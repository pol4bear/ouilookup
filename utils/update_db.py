#!/usr/bin/env python3

from pathlib import Path
from io import StringIO
import os
import sys
import requests
import csv
import sqlite3

color_black = '\033[30m'
color_red = '\033[31m'
color_blue = '\033[34m'
color_end = '\033[0m'

def update_db():
  working_dir = Path(os.path.dirname(os.path.realpath(__file__))).parent
  print(f"{color_blue}[i] OUI information update started.{color_end}")

  try:
    print("[+] Downloading latest OUI information from server...")
    response = requests.get('https://standards-oui.ieee.org/oui/oui.csv')
    response.raise_for_status()
  except:
    print(f"{color_red}[!] Failed to get latest OUI information from server.{color_end}")
    sys.exit(1)
  oui_informations = csv.reader(StringIO(response.text))

  oui_db = working_dir / 'oui.db'
  if oui_db.exists():
    os.remove(oui_db)
  conn = sqlite3.connect((working_dir / 'oui.db').absolute())
  cursor = conn.cursor()

  print("[+] Creating OUI table in database...")
  cursor.execute("CREATE TABLE oui (id INTEGER PRIMARY KEY AUTOINCREMENT, oui TEXT, organization_name TEXT, organization_address TEXT)")

  print("[+] Adding OUI information to table...")
  next(oui_informations) # Skip CSV header.
  oui_count = 0
  for info in oui_informations:
    cursor.execute(f"INSERT INTO oui (oui, organization_name, organization_address) VALUES(?, ?, ?)", (info[1], info[2], info[3]))
    oui_count += 1
  conn.commit()
  conn.close()

  print(f"{color_blue}[i] Successfully added {oui_count:,} OUI information.{color_end}")

if __name__ == "__main__":
  update_db()

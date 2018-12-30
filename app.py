# this is to show how I would create the table SONGS, but is not actually used

	# CREATE TABLE `oidd105music`.`songs` (
	#   `id` INT NOT NULL,
	#   `Collection` VARCHAR(45) NULL,
	#   `Name` VARCHAR(45) NULL,
	#   `Key` VARCHAR(45) NULL,
	#   `BPM` VARCHAR(45) NULL,
	#   `Energy` INT NULL,
	#   PRIMARY KEY (`id`),
	#  UNIQUE INDEX `Name_UNIQUE` (`Name` ASC));

# ------------------------------------------------------------------------------

# initial imports
from flask import Flask
from flask import render_template
from flask import request

import pymysql
import json

# instance and config
app = Flask(__name__)
app.config['TEMPLATES_AUTO_RELOAD'] = True


#------------------------------------------------------------------------------


# database connection
connection = pymysql.connect(host='127.0.0.1', user='root', db='oidd105music')
cursor = connection.cursor()

# functions
def getAllSongs():
	query = "SELECT * FROM songs ORDER BY Energy DESC"
	cursor.execute(query)
	result = cursor.fetchall()
	return result

def getMatchingSongs(key, bpm, energy, key_flag, bpm_flag, energy_flag):
	query = "SELECT * FROM songs"
	key_root = key[0]
	bpm_low = float(bpm) - 7
	bpm_high = float(bpm) + 7
	energy_low = float(energy)
	energy_high = 8

	if key_flag == "true":
		query += " WHERE songs.Key LIKE '%" + key[0] + "%'"
		if bpm_flag == "true":
			query += " and songs.BPM BETWEEN " + str(bpm_low) + " and " + str(bpm_high)
		if energy_flag == "true":
			query += " and songs.Energy BETWEEN " + str(energy_low) + " and " + str(energy_high)
	elif bpm_flag == "true":
		query += " WHERE songs.BPM BETWEEN " + str(bpm_low) + " and " + str(bpm_high)
		if energy_flag == "true":
			query += " and songs.Energy BETWEEN " + str(energy_low) + " and " + str(energy_high)
	elif energy_flag == "true":
		query += " WHERE songs.Energy BETWEEN " + str(energy_low) + " and " + str(energy_high)
		
	query += ' ORDER BY songs.Energy DESC'

	cursor.execute(query)
	result = cursor.fetchall()
	return result

# routes
@app.route("/")
def main():
	songs = getAllSongs()
	return render_template('index.html',
							songs=songs)


@app.route("/matchSong", methods=['POST'])
def examplePost():
	key = request.values.get("key")
	bpm = request.values.get("bpm")
	energy = request.values.get("energy")

	key_flag = request.values.get("flags[filter_key]")
	bpm_flag = request.values.get("flags[filter_bpm]")
	energy_flag = request.values.get("flags[filter_energy]")

	matches = getMatchingSongs(key, bpm, energy, key_flag, bpm_flag, energy_flag)
	return json.dumps(matches)


#------------------------------------------------------------------------------


if __name__ == "__main__":
	app.run()
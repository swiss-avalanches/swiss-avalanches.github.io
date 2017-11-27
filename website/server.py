from flask import Flask
from flask_cors import CORS
import flask
import glob
import os

"""
Install Flask and flask-cors with pip3
Run with `FLASK_APP=server.py flask run`
Open index.html
"""

app = Flask(__name__)
CORS(app)

dir_to_serve = "../json-snowmaps"

@app.route("/")
def ls():
    files = [os.path.split(path)[1] for path in glob.glob(os.path.join(dir_to_serve, "*"))]
    return flask.jsonify(files)

@app.route('/<path:path>')
def send_file(path):
    return flask.send_from_directory(dir_to_serve, path)

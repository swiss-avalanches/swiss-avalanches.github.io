from flask import Flask
from flask_cors import CORS
import flask
import glob
import os
import pandas as pd
import sys
import webbrowser

app = Flask(__name__, static_url_path='')
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0  # TODO remove in prod
CORS(app)

project_dir = os.path.abspath(os.path.join(app.root_path, '..'))

"""
Load accident data and make it ready to be served
"""
accidents_file = os.path.join(project_dir, "data/accidents/accidents.csv")
accidents_data = pd.read_csv(accidents_file)
accidents_json = accidents_data.to_json(orient='index')

@app.route('/')
def root():
    return app.send_static_file('index.html')

@app.route('/accidents')
def accident_data():
    response = app.response_class(
        response=accidents_json,
        status=200,
        mimetype='application/json'
    )
    return response

webbrowser.open('http://localhost:5000/')

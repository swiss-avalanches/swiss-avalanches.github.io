import flask
import glob
import json
import os
import pandas as pd
import sys
import webbrowser
from datetime import datetime
from flask import Flask, request
from flask_cors import CORS

app = Flask(__name__, static_url_path='')
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0  # TODO remove in prod
CORS(app)

project_dir = os.path.abspath(os.path.join(app.root_path, '..'))

"""
DATA LOADING
"""
accidents_file = os.path.join(project_dir, "data/accidents/accidents.csv")
accidents_data = pd.read_csv(accidents_file)
accidents_json = accidents_data.to_json(orient='index')

maps_dirs = [os.path.join(project_dir, dir_) for dir_ in ["json-maps", "json-snowmaps"]]
maps_files = [f for dir_ in maps_dirs for f in glob.glob(os.path.join(dir_, "*.json"))]
maps_files_with_date = [(datetime.strptime(os.path.basename(f)[:8], "%Y%m%d"), f) for f in maps_files]

"""
ROUTING
"""


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


@app.route('/maps', methods=['GET'])
def maps():
    """Serves maps JSON files

    Expect url of the form
    localhost:5000/maps?from=2012-10-08&to=2012-10-20
    """
    from_date = request.args.get('from')
    to_date = request.args.get('to')
    assert from_date and to_date, 'Unable to serve request: missing from or to date'

    from_date = datetime.strptime(from_date, "%Y-%m-%d")
    to_date = datetime.strptime(to_date, "%Y-%m-%d")

    selected_files = [(date, file) for date, file in maps_files_with_date if date >= from_date and date <= to_date]
    json_to_send = {datetime.strftime(date, "%Y-%m-%d"): json.load(open(f, 'r')) for (date, f) in selected_files}

    return flask.jsonify(json_to_send)


webbrowser.open('http://localhost:5000/')

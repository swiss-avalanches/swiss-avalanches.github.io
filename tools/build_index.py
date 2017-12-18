import glob
import json
import os

files = sorted(os.path.basename(f) for f in glob.glob("data/json-maps/*.json"))
json.dump(files, open('data/maps-index.json', 'w'))

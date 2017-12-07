### Front end

All front end files are in `website/static` and are served at the root url by the server. We follow the following organisation:

- global app logic goes into `js/app.js`,
- utility tools that can be reuse across component go into `js/utils.js`,
- each display component has its own file with associated *name*, for example `js/polar.js`. It is imported in `index.html` and should have no side effect. For D3 component the `div` element should have for id *name*. Each component defines the following functions/callback:
    - `create{Name}`

### Back end

Install `Flask` and `flask-cors` with pip3
Run from project root with `FLASK_APP=website/server/server.py flask run`
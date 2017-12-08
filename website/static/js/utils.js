function aspect(aspectString, output) {
    // output should be 'categorical', 'ratio' or 'angle'

    var categorical = undefined;
    switch (aspectString) {
        case 'N':
            categorical = 0
            break;
        case 'NNE':
            categorical = 1
            break;
        case 'NE':
            categorical = 2
            break;
        case 'ENE':
            categorical = 3
            break;
        case 'E':
            categorical = 4
            break;
        case 'ESE':
            categorical = 5
            break;
        case 'SE':
            categorical = 6
            break;
        case 'SSE':
            categorical = 7
            break;
        case 'S':
            categorical = 8
            break;
        case 'SSW':
            categorical = 9
            break;
        case 'SW':
            categorical = 10
            break;
        case 'WSW':
            categorical = 11
            break;
        case 'W':
            categorical = 12
            break;
        case 'WNW':
            categorical = 13
            break;
        case 'NW':
            categorical = 14
            break;
        case 'NNW':
            categorical = 15
            break;
        default:
            break;
    }

    if (output == 'categorical') {
        return categorical;
    } else if (output == 'ratio') {
        return categorical / 16.;
    } else if (output == 'angle') {
        return categorical * 2. * Math.PI / 16.;
    } else {
        throw 'aspect output "{}" should be in {}'.formatUnicorn(output, ['categorical', 'ratio', 'angle']);
    }
}

function object2array(obj) {
    // {1: elem1, 2: elem2, ...} -> [elem1, elem2, ...]
    return $.map(obj, function(value, index) {
        return [value];
    });
}

function dangerColor(dangerLevel) {
    switch (dangerLevel) {
        case 1: 
        case "1":
            return "#ccff66";
        case 2: 
        case "2": 
            return "#ffff00";
        case 3: 
        case "3": 
            return "#ff9900";
        case 4: 
        case "4": 
            return "#ff0000";
        case 5: 
        case "5": 
            return "#9102ff";
        default: 
            return "#95a5a6";
    }
}
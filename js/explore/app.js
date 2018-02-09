var $ = jQuery

/*
 * DATA LOADING
 */

var accidentsData = null;

$.getJSON('/data/accidents/accidents.json', function (data) {
    accidentsData = object2array(data);
    for (var i = 0; i < accidentsData.length; i++) {
        accidentsData[i].id = accidentDatumId(accidentsData[i]);
    }

    d3.select('#filters').append("dl");
    createComponents();
    updateComponents();
    updateFilterList();
    updateSelectionCard();

    if (! readCookie('introDone')) {
        startTutorial();
    }
});

$(window).resize(function () {
    d3.selectAll('.dashboard-container svg').remove();
    globalFilters = [];
    selectedPoint = null;
    createComponents();
    updateComponents();
    updateFilterList();
    updateSelectionCard();
});

var mapsIndex = null;

$.getJSON('/data/maps-index.json', function (data) {
    mapsIndex = data;
});

function mapsBetweenDates(from, to) {
    // from, to format YYYYMMDD (both included)
    if (!mapsIndex) {
        return [];
    }

    return _(mapsIndex)
        .dropWhile(function (d) {
            return d.slice(0, 8) < from;
        })
        .takeWhile(function (d) {
            return d.slice(0, 8) <= to;
        })
        .value();
}

function downloadAllMaps(maps) {
    if (maps.length > 1000) {
        throw "You try to download more than 1000 JSON maps, that's too much man!"
    }
    var promises = _(maps).map(function (m) {
        return $.getJSON('/data/json-maps/' + m);
    });
    allPromise = Promise.all(promises);
    allPromiseWithNames = allPromise.then(function (arr) {
        return _(arr).map(function (x, i) {
            return [maps[i], x];
        }).value()
    });
    return allPromiseWithNames;
}

/*
 * FILTERS SET UP
 */

var globalFilters = [];

function addFilter(name, lambda, removeMe) {
    globalFilters.push({
        'name': name,
        'lambda': lambda,
        'activated': true,
        'remove': removeMe
    });
    updateComponents();
    updateFilterList();
}

function removeFilter(name) {
    var removeAndKeep = _.partition(globalFilters, function (d) {
        return d.name === name
    })
    globalFilters = removeAndKeep[1]
    removeAndKeep[0].forEach(function (d) {
        d.remove()
    })

    updateComponents();
    updateFilterList();
}

function updateFilterList() {
    fs = globalFilters.length > 0 ? globalFilters : [{
        name: "Drag & drop on any component..."
    }];
    var filterList = d3.select('#filters dl').selectAll("dd").data(fs, function (x) {
        return x.name;
    });

    var elem = filterList.enter().insert("dd")

    if (globalFilters.length > 0) {
        elem.insert('text').text('x\xa0\xa0')
            .attr('class', 'deleteFilterMark')
            .on('click', function (a) {
                if (a.name != 'Drag & drop on any component...') {
                    removeFilter(a.name);
                }
            })
    }


    elem.insert('text').text(function (a) {
        return a.name;
    });

    filterList.exit().remove();
}

function filterData(data) {
    var filtered = data;
    globalFilters.forEach(function (aFilter) {
        filtered = filtered.filter(aFilter.lambda)
    });
    return filtered;
}

/*
 * POINT SELECTION
 */

var selectedPoint = null;

function selectPoint(id) {
    if (selectedPoint != id) {
        selectedPoint = id;
        var elem = _(accidentsData).find(function (d) {return d.id == id; })
        var year = +elem.Date.slice(6, 10),
            month = +elem.Date.slice(3, 5) - 1,
            day = +elem.Date.slice(0, 2),
            date = new Date(year, month, day);

        var fromDate = new Date(date),
            toDate = new Date(date);
        
        fromDate.setDate(fromDate.getDate() - 10);
        toDate.setDate(toDate.getDate() + 3);

        function formatDate(d) {
            var month = 1 + d.getMonth();
            month = month < 10 ? "0" + month : month;
            var day = + d.getDate();
            day = day < 10 ? "0" + day : day;
            return "" + d.getFullYear() + month + day;
        }

        fromDate = formatDate(fromDate);
        toDate = formatDate(toDate);

        var mapsToDownload = mapsBetweenDates(fromDate, toDate);
        downloadAllMaps(mapsToDownload).then(function (allMaps){
            if (id == selectedPoint) {  // if still selected then update maps
                updateTabMap(allMaps);
            }
        })
    } else {
        selectedPoint = null;
        updateTabMap(null);
    }
    updateComponents();
    updateSelectionCard();
}

function applyPointSelection(data) {
    if (!selectedPoint) {
        return data;
    }

    var newData = [];
    for (var i = 0; i < data.length; i++) {
        var element = data[i];
        if (data[i].id === selectedPoint) {
            newDatum = $.extend(true, {}, element);
            newDatum.selected = true;
            newData.push(newDatum);
        } else {
            newData.push(element);
        }
    }
    return newData;
}

function updateSelectionCard() {
    function card(selection) {
        if (!selectedPoint) {
            selection.append('dd').text('Click on a point to select...');
        } else {
            selectedDatum = accidentsData.find(function (x) {
                return x.id == selectedPoint;
            });
            selection.append('dk').text("Date")
            selection.append('dd').text(selectedDatum.Date);
            selection.append('dk').text("Elevation")
            selection.append('dd').text("" + selectedDatum.Elevation + "m");
            selection.append('dk').text("Aspect")
            selection.append('dd').text(selectedDatum.Aspect);
            selection.append('dk').text("Danger Level")
            selection.append('dd').text(selectedDatum['Danger level']);
            selection.append('dk').text("Caught")
            selection.append('dd').text(selectedDatum.caught);
            selection.append('dk').text("Killed")
            selection.append('dd').text(selectedDatum.killed);
            selection.append('dk').text("Activity")
            selection.append('dd').text(Activity(selectedDatum.Activity));
        }
    }

    d3.select('#selection dl').selectAll('*').remove();

    var filterList = d3.select('#selection dl').call(card);
}

/*
 * COLOR SELECTION
 */

var selectedColor = 'danger';

function categoryColor(datum) {
    switch (selectedColor) {
        case 'danger':
            return dangerColor(datum['Danger level'])
        case 'activity':
            return activityColor(datum['Activity'])
    }
}

function updateCategorySelected(newCat) {
    d3.selectAll('.selectKeyPoint').classed('selected', false)
    d3.select('#' + newCat + 'Select').classed('selected', true)
    selectedColor = newCat;
    updateComponents();
}

function applyColor(data) {
    data.forEach(function (d) {
        d.color = categoryColor(d);
    })
    return data;
}

/*
 * COMPONENT INITIALISATION
 */

function createComponents() {
    data = filterData(accidentsData);
    data = applyPointSelection(data);
    data = applyColor(data);
    createMap(data, addFilter, removeFilter, selectPoint);
    createPolar(data, addFilter, removeFilter, selectPoint);
    createElevation(data, addFilter, removeFilter, selectPoint);
    createMonth(data, addFilter, removeFilter, selectPoint);
    createDangers(data, addFilter, removeFilter, selectPoint);
    createActivities(data, addFilter, removeFilter, selectPoint);
    createTextual(data, addFilter, removeFilter, selectPoint);
    createYears(data, addFilter, removeFilter, selectPoint);
    updateTabMap(null);
}

function updateComponents() {
    data = filterData(accidentsData);
    data = applyPointSelection(data);
    data = applyColor(data);
    updatePolar(data, addFilter, removeFilter, selectPoint);
    updateElevation(data, addFilter, removeFilter, selectPoint);
    updateMonth(data, addFilter, removeFilter, selectPoint);
    updateMap(data, addFilter, removeFilter, selectPoint);
    updateDangers(data, addFilter, removeFilter, selectPoint);
    updateActivities(data, addFilter, removeFilter, selectPoint);
    updateTextual(data, addFilter, removeFilter, selectPoint);
    updateYears(data, addFilter, removeFilter, selectPoint);
}
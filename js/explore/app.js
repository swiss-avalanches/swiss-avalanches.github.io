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

    d3.select('#filters').append("dl")
    createComponents();
    updateComponents();
    updateFilterList();
    updateSelectionCard();
});

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
    var removeAndKeep = _.partition(globalFilters, function (d) { return d.name === name})
    globalFilters = removeAndKeep[1]
    removeAndKeep[0].forEach(function (d) {d.remove()})

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
        elem.insert('text').text('X\xa0\xa0\xa0\xa0')
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
    } else {
        selectedPoint = null;
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
 * COMPONENT INITIALISATION
 */

function createComponents() {
    data = filterData(accidentsData);
    data = applyPointSelection(data);
    createPolar(data, addFilter, removeFilter, selectPoint);
    createElevation(data, addFilter, removeFilter, selectPoint);
    createMonth(data, addFilter, removeFilter, selectPoint);
    createMap(data, addFilter, removeFilter, selectPoint);
    createDangers(data, addFilter, removeFilter, selectPoint);
    createActivities(data, addFilter, removeFilter, selectPoint); 
    createTextual(data, addFilter, removeFilter, selectPoint);
    createYears(data, addFilter, removeFilter, selectPoint);
}

function updateComponents() {
    data = filterData(accidentsData);
    data = applyPointSelection(data);
    updatePolar(data, addFilter, removeFilter, selectPoint);
    updateElevation(data, addFilter, removeFilter, selectPoint);
    updateMonth(data, addFilter, removeFilter, selectPoint);
    updateMap(data, addFilter, removeFilter, selectPoint);
    updateDangers(data, addFilter, removeFilter, selectPoint);
    updateActivities(data, addFilter, removeFilter, selectPoint);   
    updateTextual(data, addFilter, removeFilter, selectPoint);
    updateYears(data, addFilter, removeFilter, selectPoint);
}
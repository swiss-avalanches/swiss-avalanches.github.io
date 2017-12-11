/*
 * DATA LOADING
 */

var accidentsData = null;

$.getJSON('/accidents', function (data) {
    accidentsData = object2array(data);
    for (var i = 0; i < accidentsData.length; i++) {
        accidentsData[i].id = accidentDatumId(accidentsData[i]);
    }
    
    console.log(accidentsData)
    d3.select('#filters').append("dl")
    createComponents();
    updateComponents();
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
    })
    updateComponents()
    updateFilterList()
}

function removeFilter(name) {
    var newGlobalFilters = [];
    for (var i = 0; i < globalFilters.length; i++) {
        var element = globalFilters[i];
        if (element.name != name) {
            newGlobalFilters.push(element)
        } else {
            element.remove();
        }
    }
    globalFilters = newGlobalFilters

    updateComponents()
    updateFilterList()
}

function updateFilterList() {
    var filterList = d3.select('#filters dl').selectAll("dd").data(globalFilters, function (x) {
        return x.name
    });
    filterList.enter().insert("dd")
        .text(function (a) {
            return a.name
        })
        .on('click', function (a) {
            removeFilter(a.name);
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

/*
 * COMPONENT INITIALISATION
 */

function createComponents() {
    data = filterData(accidentsData);
    data = applyPointSelection(data);
    createPolar(data, addFilter, removeFilter, selectPoint);
    createElevation(data, addFilter, removeFilter, selectPoint);
    createElevation(data, addFilter, removeFilter);
}

function updateComponents() {
    data = filterData(accidentsData);
    data = applyPointSelection(data);
    updatePolar(data, addFilter, removeFilter, selectPoint);
    updateElevation(data, addFilter, removeFilter, selectPoint);
    updateElevation(data, addFilter, removeFilter);
}

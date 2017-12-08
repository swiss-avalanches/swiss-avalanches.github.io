
/*
 * DATA LOADING
*/

var accidentsData = null;

$.getJSON('/accidents', function (data) {
    accidentsData = object2array(data);
    console.log(accidentsData)
    d3.select('#filters').append("dl")
    createComponents(accidentsData);
})

/*
 * FILTERS SET UP
 */

var globalFilters = []

function addFilter(name, lambda, removeMe) {
    globalFilters.push({'name': name, 'lambda': lambda, 'activated': true, 'remove': removeMe})
    updateComponents(filterData(accidentsData))
    updateFilterList()
}

function removeFilter(name) {
    var newGlobalFilters = []
    for (var i = 0; i < globalFilters.length; i++) {
        var element = globalFilters[i];
        if (element.name != name) {
            newGlobalFilters.push(element)
        } else {
            element.remove();
        }
    }
    globalFilters = newGlobalFilters

    updateComponents(filterData(accidentsData))
    updateFilterList()
}

function updateFilterList() {
    var filterList = d3.select('#filters dl').selectAll("dd").data(globalFilters, function(x) {return x.name});
    filterList.enter().insert("dd")
        .text(function (a) {return a.name})
        .on('click', function (a) {
            removeFilter(a.name);
        });
    filterList.exit().remove();  // TODO buggy
}

function filterData(data) {
    var filtered = data;
    globalFilters.forEach(function (aFilter) {
        filtered = filtered.filter(aFilter.lambda)
    });
    return filtered;
}

/*
 * COMPONENT INITIALISATION
*/

function createComponents(data) {
    createPolar(data, addFilter, removeFilter);
}

function updateComponents(data) {
    updatePolar(data, addFilter, removeFilter);
}

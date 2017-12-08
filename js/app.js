
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

function addFilter(name, lambda) {
    globalFilters.push({'name': name, 'lambda': lambda, 'activated': true})
    updateComponents(filterData(accidentsData))
    updateFilterList()
}

function removeFilter(name) {
    globalFilters = globalFilters.filter(function (aFilter) { return aFilter.name != name })
    updateComponents(filterData(accidentsData))
    updateFilterList()
}

function updateFilterList() {
    console.log('list', globalFilters)
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
        console.log(aFilter.name, 'applied', filtered.length, 'remaining')
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

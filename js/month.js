// We will compute in this histogram the number of accidents per month

function removeUndef(data) {
    return _.omit(data, _.filter(_.keys(data), function(key) { return _.isUndefined(data[key]) }))
}

function groupByMonth(data) {

    function filterDate(x) {
        var date = x.Date;//(x.Date).substring(3, 4);;
        return {
            Date: date
        };
    }

    var dataDate = removeUndef(_.map(data, filterDate));
    
    function filterMonth(x) {
        var month = x
    }


    return data;
}

function createMonth(accidentsData, addFilter, removeFilter) {
    //console.log(groupByMonth(accidentsData))
    
}

function updateMonth(accidentsData, addFilter, removeFilter) {
    
} 
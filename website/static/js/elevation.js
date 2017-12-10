var propertiesElevation = {}
var elevations = [0, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500]; //TODO linspace si existe?

function devel(data) {
    function filter(x) {
        var newElev = x.Elevation - (x.Elevation % 500) + 500;
        return {
            elevation: newElev,
            killed: x.killed
        };
    }

    function filter2(array) {
        function redFunc(sum, obj) {
            return sum + obj.killed;
        }
        return _.reduce(array, redFunc, 0);
    }


    var groupped = _.mapValues(_.groupBy(_.map(data, filter), 'elevation'), filter2);
    return groupped;
}

function createElevation(accidentsData, addFilter, removeFilter) {
    var histData = devel(accidentsData);

    var elevations = Object.keys(histData);
    var kills = Object.values(histData);

    var newData = [];

    for(var i = 0; i < elevations.length; ++i) {
         newData.push({
            elevation: elevations[i],
            killed: kills[i]
        });
    }

    console.log(newData);

    var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var x = d3.scaleBand()
            .range([0, width])
            .padding(0.1);

    var y = d3.scaleLinear()
            .range([height, 0]);

    var svg = d3.select("#elevation").append("svg") // TODO check "body" "#elevation"
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", 
                  "translate(" + margin.left + "," + margin.top + ")");

    x.domain(newData.map(function(d) { return d.elevation; }));
    y.domain([0, d3.max(newData, function(d) { return d.killed; })]);


    // append the rectangles for the bar chart
    svg.selectAll(".bar")
        .data(newData)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.elevation); })
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return y(d.killed); })
        .attr("height", function(d) { return height - y(d.killed); });

    // add the x Axis
     svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // add the y Axis
    svg.append("g")
        .call(d3.axisLeft(y));
    
    updateElevation(newData, addFilter, removeFilter) 
}

function updateElevation(accidentsData, addFilter, removeFilter) {

}
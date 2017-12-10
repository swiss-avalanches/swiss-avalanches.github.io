var propertiesElevation = {}
var elevations = [0, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500]; //TODO linspace si existe?

// to be mapped with elevations array
function bucketifyElevation(data){
    var buckets = d3.range(9).map(function(d){return 0;});
    for (let i = 0; i < data.length; i++) {
        var element = data[i];
        var elementElevation = element.altitude - (element.altitude % 500) + 500;
        buckets[elevations.indexOf(elementElevation)] +=  element.killed; 
    }
    return buckets;
}

// naive approach: devrait retourner array avec plusieurs fois les memes niveaux 
function cumulElevation(data){
    var new_data = [];
    var j=0;
    for (let i = 0; i < data.length; i++) {
        var element = data[i];
        var numKilled = element.killed;
        for (let k = 0; k < numKilled; k++){
            new_data[j+k] = element.altitude - (element.altitude % 500) + 500;
        }
        j += numKilled;
    }
    return new_data;
}

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
     const histData = devel(accidentsData);

     var svg = d3.select("#elevation").append("svg")
    /*  var data = cumulElevation(accidentsData); 
    //var data =  [500, 500, 1000, 1500, 500, 2000, 4500, 2500, 2500, 2500, 3000, 3500, 1500]

    var formatCount = d3.format(",.0f");
    
    var svg = d3.select("#elevation").append("svg"),
        margin = {top: 10, right: 30, bottom: 30, left: 30},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    var x = d3.scaleLinear()
            .domain([500, 5000])
            .rangeRound([0, width]);
    
    var bins = d3.histogram()
        .domain(x.domain())
        .thresholds(x.ticks(10))
        (data);
    
    var y = d3.scaleLinear()
        .domain([0, d3.max(bins, function(d) { return d.length; })])
        .range([height, 0]);
    
    var bar = g.selectAll(".bar")
      .data(bins)
      .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; });
    
    bar.append("rect")
        .attr("x", 1)
        .attr("width", x(bins[0].x1) - x(bins[0].x0)-1) // retiré
        .attr("height", function(d) { return height - y(d.length); });
    
    bar.append("text")
        .attr("dy", ".75em")
        .attr("y", 6)
        .attr("x", (x(bins[0].x1) - x(bins[0].x0)) / 2)
        .attr("text-anchor", "middle")
        .text(function(d) { return formatCount(d.length); });
    
    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));
     */
    updateElevation(data, addFilter, removeFilter) 
}

function updateElevation(accidentsData, addFilter, removeFilter) {

}
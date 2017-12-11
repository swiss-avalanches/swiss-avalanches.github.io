var propertiesElevation = {
    elevations: [1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500]
};

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
    var parent = document.getElementById("polar");
    containerWidth = parent.clientWidth;
    containerHeight = constants.componentHeight;

    var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = containerWidth - margin.left - margin.right,
        height = containerHeight - margin.top - margin.bottom;

    var x = d3.scaleBand()
            .range([0, width])
            .padding(0.1);
    
    x.domain(propertiesElevation.elevations);

    var svg = d3.select("#elevation").append("svg") 
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", 
            "translate(" + margin.left + "," + margin.top + ")");

    // add the x Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    
    // y axis label
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("class", "histogram-label")
        .attr("transform", "translate("+ -30 +","+(height/2)+")rotate(-90)")
        .text("deaths");
    
    // x axis label
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("class", "histogram-label")
        .attr("transform", "translate("+ (width/2) +","+(height + 30)+")")
        .text("elevation (m)");

    propertiesElevation.svg = svg;
    propertiesElevation.height = height;
    propertiesElevation.width = width;
    propertiesElevation.x = x;
}

function updateElevation(accidentsData, addFilter, removeFilter) {
    var svg = propertiesElevation.svg;
    var height = propertiesElevation.height;
    var width = propertiesElevation.width;
    var x = propertiesElevation.x;

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

    var y = d3.scaleLinear()
    .range([height, 0]);

    y.domain([0, d3.max(newData, function(d) { return d.killed; })]);


    // append the rectangles for the bar chart
    var bars = svg.selectAll(".bar")
      .data(newData, function (d) {return d.elevation;});
    

    bars.enter()
        .append("rect")
        .attr("fill", function(d, i) { return "#2c3e50"; })
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.elevation); })
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return y(d.killed); })
        .attr("height", function(d) { return height - y(d.killed); })
    .merge(bars)
        .transition().duration(500)
        .attr("y", function(d) { return y(d.killed); })
        .attr("height", function(d) { return height - y(d.killed); });

    svg.select(".y-axis").remove();

    // add the y Axis
    svg.append("g")
        .call(d3.axisLeft(y))
        .attr("class", "y-axis");
}
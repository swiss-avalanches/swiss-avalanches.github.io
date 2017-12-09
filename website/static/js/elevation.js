var propertiesElevation = {}
var elevations = [500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500]; //TODO linspace si existe?

function bucketifyElevation(data){
    var buckets = d3.range(9).map(function(d){return 0;});
    for (let i = 0; i < data.length; i++) {
        var element = data[i];
        var elementElevation = element.altitude-(element.altitude%500)+500;
        buckets[elevations.indexOf(elementElevation)] =buckets[elevations.indexOf(elementElevation)] + element.killed;
    }
    return buckets
}

function createElevation(accidentsData, addFilter, removeFilter) {
    //propertiesElevation.rangeAltitudes = d3.range(7).map(function(i){return 1000+i*500;});
    var data = d3.range(1000).map(d3.randomBates(10));
    
    var formatCount = d3.format(",.0f");
    
    var svg = d3.select("svg"),
        margin = {top: 10, right: 30, bottom: 30, left: 30},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    var x = d3.scaleLinear()
        .rangeRound([0, width]);
    
    var bins = d3.histogram()
        .domain(x.domain())
        .thresholds(x.ticks(9))
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
        .attr("width", x(bins[0].x1) - x(bins[0].x0) - 1)
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
    
}
function originalcreateElevation(){
    var data = bucketifyElevation(accidentsData);

    var width = 960,
    height = 500;

    var x = d3.scaleBand().range([0, width], .1);

    var y = d3.scaleLinear().range([height, 0]);

    var chart = d3.select(".chart")
        .selectAll("div")
        .data(data)
        .enter().append("div")
        .attr("width", width)
        .attr("height", height);

    
    x.domain([0, d3.max(data)]);
    y.domain([0, d3.max(elevations)]);

    var bar = chart.selectAll("g")
        .data(data)
        .enter().append("g")
        .attr("transform", function(d) { return "translate(" + x(d.value) + ",0)"; });

    bar.append("rect")
        .attr("y", function(d) { return y(d); })
        .attr("height", function(d) { return height - y(d.value); })
        .attr("width", x.bandwidth());

    //bar.append("text")
    //    .attr("x", x.bandwidth() / 2)
    //    .attr("y", function(d) { return y(d.value) + 3; })
    //    .attr("dy", ".75em")
    //    .text(function(d) { return d.value; });

    function type(d) {
        d.value = +d.value; // coerce to number
    return d.value;
    }
    updateElevation(data, addFilter, removeFilter)
}

function updateElevation(accidentsData, addFilter, removeFilter) {

}
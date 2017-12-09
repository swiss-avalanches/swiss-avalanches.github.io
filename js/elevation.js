var propertiesElevation = {}
var elevations = [500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500]; //TODO linspace si existe?

function bucketifyElevation(data){
    var buckets = [];
    for (let i = 0; i < data.length; i++) {
        const element = data[i];
        const elementElevation = element.altitude-(element.altitude%500)+500;
        
        buckets[elevations.indexOf(elementElevation)] += element.killed;
         
    }
    return buckets
}

function createElevation(accidentsData, addFilter, removeFilter) {
    //propertiesElevation.rangeAltitudes = d3.range(7).map(function(i){return 1000+i*500;});
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
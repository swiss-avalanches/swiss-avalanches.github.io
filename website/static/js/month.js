var propertiesMonth = {};

// We will compute in this histogram the number of accidents per month
function removeUndef(data) {
    return _.omit(data, _.filter(_.keys(data), function(key) { return _.isUndefined(data[key]) }))
}


function groupByMonth(data) {
    
    data = removeUndef(data);

    function filterMonth(x) {
        var date = String(x.Date);
        var month = date.substring(3,5);
        return month;
    }

    var newData =_.countBy(_.map(data, filterMonth));

    return newData;
}


function createMonth(accidentsData, addFilter, removeFilter) {
   var margin = {top: 20, right: 20, bottom: 30, left: 40},
     width = 960 - margin.left - margin.right,
     height = 500 - margin.top - margin.bottom


   var svg = d3.select("#month").append("svg") 
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", 
            "translate(" + margin.left + "," + margin.top + ")");

  propertiesMonth.svg = svg;
  propertiesMonth.width = width;
  propertiesMonth.height = height;
} 

function updateMonth(accidentsData, addFilter, removeFilter) {
    var height = propertiesMonth.height;
    var width = propertiesMonth.width;
    var svg = propertiesMonth.svg;

    var data = groupByMonth(accidentsData);

    var months = Object.keys(data);
    var accidents = Object.values(data);

    var newData = []

    for(var i = 0; i < elevations.length; ++i) {
        newData.push({
           month: months[i],
           accident: accidents[i]
       });
   }

    var x = d3.scaleBand()
        .range([0, width])
        .padding(0.1);

    var y = d3.scaleLinear()
        .range([height, 0]);

    x.domain(newData.map(function(d) { return d.month; }));
    y.domain([0, d3.max(newData, function(d) { return d.accident; })]);


    // append the rectangles for the bar chart
    var enterData = svg.selectAll(".bar")
        .data(newData); //, function (d) {return d.month});

    enterData.enter().append("rect")
        .attr("class", "bar")
        .attr("fill", function(d, i) { return "#c0392b" })
    .merge(enterData)
        .attr("x", function(d) { return x(d.month); })
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return y(d.accident); })
        .transition().duration(1000)
        .attr("height", function(d) { return height - y(d.accident); })

    // add the x Axis
    svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

    // add the y Axis
    svg.append("g")
      .call(d3.axisLeft(y));





}

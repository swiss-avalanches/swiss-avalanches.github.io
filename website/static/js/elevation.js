var propertiesElevation = {
    elevations: [1000, 1500, 2000, 2500, 3000, 3500, 4000],
};

function devel(data) {
    function filter(x) {
        var newElev = x.Elevation - (x.Elevation % 500);
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

    
        var startDragX = null,
        endDragX = null,
        fromIdx = null,
        toIdx = null;
    
      var drag = d3.drag()
        .on("drag", dragged)
        .on("start", startDrag)
        .on("end", endDrag);
    
      var removeCurrentFilter = function () {
        if (propertiesElevation.filterName) {
          // avoids infinite calls
          var toRemove = propertiesElevation.filterName;
          propertiesElevation.filterName = undefined;
          removeFilter(toRemove);
        }
        svg.selectAll(".bar").attr("opacity", 1);
      };
    
      function startDrag() {
        startDragX = d3.event.x;
        removeCurrentFilter();
        svg.selectAll(".bar").attr("opacity", 0.5);
      }
    
      function dragged(d) {
        var endDragX = d3.event.x;
  
        var from = startDragX,
          to = endDragX;
        
        if (from > to) {
          var temp = from;
          from = to;
          to = temp;
        }
  
        fromIdx = Math.floor((from / x.step()));
        toIdx = Math.ceil((to / x.step()));
  
        svg.selectAll('.bar').attr('opacity', function (d) {
          var idx = propertiesElevation.elevations.findIndex(function (a) { return d.elevation == a; });
          return idx >= fromIdx && idx < toIdx ? 1 : 0.5;
        });
      }
    
      function endDrag() {
        if (fromIdx <= 0 && toIdx >= propertiesElevation.elevations.length) {
            removeCurrentFilter();
            return;
        }

        // filter name
        if (fromIdx <= 0) {
            filterName = "Elevation < " + propertiesElevation.elevations[toIdx] + "m";
        } else if (toIdx >= propertiesElevation.elevations.length) {
            filterName = "Elevation >= " + propertiesElevation.elevations[fromIdx] + "m";
        } else {
            filterName = "Elevation " + propertiesElevation.elevations[fromIdx] + "m-" + propertiesElevation.elevations[toIdx] + "m";
        }
    
        var filterFunction = function (d) {
          var fromAlt = fromIdx >= 0 ? propertiesElevation.elevations[fromIdx] : 0,
            toAlt = toIdx < propertiesElevation.elevations.length ? propertiesElevation.elevations[toIdx] : 9999999999;
          return d.Elevation >= fromAlt && d.Elevation < toAlt;
        };
    
        propertiesElevation.filterName = filterName;
        addFilter(filterName, filterFunction, removeCurrentFilter);
      }
  

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

    
    // full clickable rect
    svg.append("g")
    .append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "white")
    .on("click", removeCurrentFilter)
    .call(drag);

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
        .attr("fill", constants.deathColor)
        .attr("class", "bar pass-through")
        .attr("x", function(d) { return x(d.elevation); })
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return y(d.killed); })
        .attr("height", function(d) { return height - y(d.killed); })
    .merge(bars)
        .transition().duration(500)
        .attr("y", function(d) { return y(d.killed); })
        .attr("height", function(d) { return height - y(d.killed); });
    
    bars.exit().remove()

    svg.select(".y-axis").remove();

    // add the y Axis
    svg.append("g")
        .call(d3.axisLeft(y))
        .attr("class", "y-axis");
}
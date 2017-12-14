
var propertiesActivities = {
  activities: [1, 2, 3].map(Activity),
};

function groupByActivities(data) {

  var preprocessedData = data.map(function(d) {
    return [Activity(d['Activity']), d['Activity'], d.killed];
  }).filter(function (d) {
    return propertiesActivities.activities.includes(d[0]);
  });

  var result = _.groupBy(preprocessedData, function (d) {
    return d[0]; 
  });
  result = _.map(result, function (d) {
    return {
      'activity': d[0][0], 
      'deaths': _.sum(_.map(d, function (x) {return x[2];})),
      'index': d[0][1],
    };
  });

  return result;
}


function createActivities(accidentsData, addFilter, removeFilter) {
  var parent = document.getElementById("dangers");
  containerWidth = parent.clientWidth;
  containerHeight = constants.componentHeight;

  var margin = {
      top: 60,
      right: 30,
      bottom: 60,
      left: 100
    },
    width = containerWidth - margin.left - margin.right,
    height = containerHeight - margin.top - margin.bottom;

    var startDragY = null,
      endDragY = null,
      fromIdx = null,
      toIdx = null;
  
    var drag = d3.drag()
      .on("drag", dragged)
      .on("start", startDrag)
      .on("end", endDrag);
  
    var removeCurrentFilter = function () {
      if (propertiesActivities.filterName) {
        // avoids infinite calls
        var toRemove = propertiesActivities.filterName;
        propertiesActivities.filterName = undefined;
        removeFilter(toRemove);
      }
      svg.selectAll(".bar").attr("opacity", 1);
    };
  
    function startDrag() {
      startDragY = d3.event.y;
      removeCurrentFilter();
      svg.selectAll(".bar").attr("opacity", 0.5);
    }
  
    function dragged(d) {
      endDragY = d3.event.y;

      var top = startDragY,
        bottom = endDragY;
      
      if (bottom < top) {
        var temp = bottom;
        bottom = top;
        top = temp;
      }

      fromIdx = Math.floor((top / y.step())) + 1;
      toIdx = Math.ceil((bottom / y.step())) + 1;

      fromIdx = Math.max(0, fromIdx);
      toIdx = Math.min(toIdx, propertiesActivities.activities.length + 1);

      svg.selectAll('.bar').attr('opacity', function (d) {
        return d.index >= fromIdx && d.index < toIdx ? 1 : 0.5;
      });
    }
  
    function endDrag() {
      if (fromIdx <= 1 && toIdx >= propertiesActivities.activities.length + 1) {
        removeCurrentFilter();
        return;
      }

      // filter name
      if (fromIdx + 1 == toIdx) {
        filterName = Activity(fromIdx) + " only";
      } else {
        filterName = "Not " + Activity(_.difference([1,2,3], [fromIdx, toIdx - 1])[0]);
      }
  
      var filterFunction = function (d) {
        return d.Activity >= fromIdx && d.Activity < toIdx;
      };
  
      propertiesActivities.filterName = filterName;
      addFilter(filterName, filterFunction, removeCurrentFilter);
    }

    var svg = d3.select("#activities").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")")

    
  // full clickable rect
    svg.append("g")
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "white")
      .on("click", removeCurrentFilter)
      .call(drag);

  var y = d3.scaleBand()
    .range([0, height])
    .padding(0.1);
  
  y.domain(propertiesActivities.activities);
  
  // add the x Axis
  // svg.append("g")
  //   .attr("transform", "translate(0," + height + ")")
  //   .call(d3.axisBottom(x));
  
  // y axis label
  // svg.append("text")
  //   .attr("text-anchor", "middle")
  //   .attr("class", "histogram-label")
  //   .attr("transform", "translate("+ -30 +","+(height/2)+")rotate(-90)")
  //   .text("activity level");
  
  svg.append("text")
    .attr("text-anchor", "middle")
    .attr("class", "histogram-label")
    .attr("transform", "translate("+ (width/2) +","+(height + 20)+")")
    .text("deaths");
  
  // add the y Axis
  svg.append("g")
  .call(d3.axisLeft(y))
  .attr('class', 'y-axis');

  propertiesActivities.y = y;
  propertiesActivities.svg = svg;
  propertiesActivities.width = width;
  propertiesActivities.height = height;
}

function updateActivities(accidentsData, addFilter, removeFilter) {
  var height = propertiesActivities.height;
  var width = propertiesActivities.width;
  var svg = propertiesActivities.svg;
  var y = propertiesActivities.y;

  var data = groupByActivities(accidentsData);

  var x = d3.scaleLinear()
    .range([0, width]);

  x.domain([0, d3.max(data, function (d) {
    return d.deaths;
  })]);


  // append the rectangles for the bar chart
  var enterData = svg.selectAll(".bar")
    .data(data, function (d) {
      return d.activity;
    });

  enterData.enter().append("rect")
      .attr("class", "bar pass-through")
      .attr("fill", function (d) {
        return activityColor(d.activity);
      })
      .attr("height", y.bandwidth())
      .attr("y", function (d) {
        return y(d.activity);
      })
      .attr("x", 1)
      .attr("width", function (d) {
        return x(d.deaths);
      })
    .merge(enterData)
      .transition().duration(500)
      .attr("y", function (d) {
        return y(d.activity);
      })
      .attr("width", function (d) {
        return x(d.deaths);
      });

  enterData.exit().remove();

  var deathLabels = svg.selectAll(".label")
    .data(data, function (d) {
      return d.activity;
    });

  deathLabels.enter().append("text")
      .attr("text-anchor", "left")
      .attr("class", "histogram-label label")
      .attr("transform", function (d) {
        return "translate("+ (x(d.deaths) + 5) +","+(y(d.activity) + y.step() / 2)+")";
      })
      .text(function (d) {return d.deaths; })
    .merge(deathLabels)
      .transition().duration(500)
      .attr("transform", function (d) {
        return "translate("+ (x(d.deaths) + 5) +","+(y(d.activity) + y.step() / 2)+")";
      })
      .text(function (d) {return d.deaths; });
  
  deathLabels.exit().remove();


}
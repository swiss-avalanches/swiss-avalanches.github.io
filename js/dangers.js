var propertiesDangers = {
  dangers: ["5", "4", "3", "2", "1"],
};

function groupByDangers(data) {

  var preprocessedData = data.map(function(d) {
    var danger = d['Danger level'];
    return [danger ? danger[danger.length - 1] : danger, d.killed];
  }).filter(function (d) {
    return propertiesDangers.dangers.includes(d[0]);
  });

  console.log(preprocessedData)

  var result = _.groupBy(preprocessedData, function (d) {
    return d[0]; 
  });
  result = _.map(result, function (d) {
    return {'danger': d[0][0], 'deaths': _.sum(_.map(d, function (x) {return x[1];}))};
  });

  console.log(result)
  return result;
}


function createDangers(accidentsData, addFilter, removeFilter) {
  var parent = document.getElementById("dangers");
  containerWidth = parent.clientWidth;
  containerHeight = constants.componentHeight * 0.7;

  var margin = {
      top: 20,
      right: 30,
      bottom: 30,
      left: 40
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
      if (propertiesDangers.filterName) {
        // avoids infinite calls
        var toRemove = propertiesDangers.filterName;
        propertiesDangers.filterName = undefined;
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

      fromIdx = Math.floor(((height - bottom) / y.step())) + 1;
      toIdx = Math.ceil(((height - top) / y.step())) + 1;

      fromIdx = Math.max(0, fromIdx);
      toIdx = Math.min(toIdx, propertiesDangers.dangers.length + 1);


      svg.selectAll('.bar').attr('opacity', function (d) {
        return d.danger >= fromIdx && d.danger < toIdx ? 1 : 0.5;
      });
    }
  
    function endDrag() {
      if (fromIdx <= 1 && toIdx >= propertiesDangers.dangers.length + 1) {
        removeCurrentFilter();
        return;
      }

      // filter name
      if (fromIdx + 1 == toIdx) {
        filterName = "Danger " + (fromIdx);
      } else {
        filterName = "Dangers " + (fromIdx) + "-" + (toIdx - 1);
      }
      console.log(filterName);
  
      var filterFunction = function (d) {
        var danger = d['Danger level'];
        if (!danger || danger.length != 1) {
          return false;
        }

        return danger >= fromIdx && danger < toIdx;
      };
  
      propertiesDangers.filterName = filterName;
      addFilter(filterName, filterFunction, removeCurrentFilter);
    }

    var svg = d3.select("#dangers").append("svg")
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
  
  y.domain(propertiesDangers.dangers);
  
  // add the x Axis
  // svg.append("g")
  //   .attr("transform", "translate(0," + height + ")")
  //   .call(d3.axisBottom(x));
  
  // y axis label
  svg.append("text")
    .attr("text-anchor", "middle")
    .attr("class", "histogram-label")
    .attr("transform", "translate("+ -30 +","+(height/2)+")rotate(-90)")
    .text("danger level");
  
  svg.append("text")
    .attr("text-anchor", "middle")
    .attr("class", "histogram-label")
    .attr("transform", "translate("+ (width/2) +","+(height + 20)+")")
    .text("deaths");
  
  // add the y Axis
  svg.append("g")
  .call(d3.axisLeft(y))
  .attr('class', 'y-axis');

  propertiesDangers.y = y;
  propertiesDangers.svg = svg;
  propertiesDangers.width = width;
  propertiesDangers.height = height;
}

function updateDangers(accidentsData, addFilter, removeFilter) {
  var height = propertiesDangers.height;
  var width = propertiesDangers.width;
  var svg = propertiesDangers.svg;
  var y = propertiesDangers.y;

  var data = groupByDangers(accidentsData);

  var x = d3.scaleLinear()
    .range([0, width]);

  x.domain([0, d3.max(data, function (d) {
    return d.deaths;
  })]);


  // append the rectangles for the bar chart
  var enterData = svg.selectAll(".bar")
    .data(data, function (d) {
      return d.danger;
    });

  enterData.enter().append("rect")
      .attr("class", "bar pass-through")
      .attr("fill", function (d) {
        return dangerColor(d.danger);
      })
      .attr("height", y.bandwidth())
      .attr("y", function (d) {
        return y(d.danger);
      })
      .attr("x", 1)
      .attr("width", function (d) {
        return x(d.deaths);
      })
    .merge(enterData)
      .transition().duration(500)
      .attr("y", function (d) {
        return y(d.danger);
      })
      .attr("width", function (d) {
        return x(d.deaths);
      });

  enterData.exit().remove();

  var deathLabels = svg.selectAll(".label")
    .data(data, function (d) {
      console.log(d)
      return d.danger;
    });

  deathLabels.enter().append("text")
      .attr("text-anchor", "left")
      .attr("class", "histogram-label label")
      .attr("transform", function (d) {
        return "translate("+ (x(d.deaths) + 5) +","+(y(d.danger) + y.step() / 2)+")";
      })
      .text(function (d) {return d.deaths; })
    .merge(deathLabels)
      .transition().duration(500)
      .attr("transform", function (d) {
        return "translate("+ (x(d.deaths) + 5) +","+(y(d.danger) + y.step() / 2)+")";
      })
      .text(function (d) {return d.deaths; });
  
  deathLabels.exit().remove();


}
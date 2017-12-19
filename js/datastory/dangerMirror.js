var propertiesDangers = {
  dangers: ["5", "4", "3", "2", "1"],
};

var maximumBoth = 25;

function dangerColor(dangerLevel) {
    switch (dangerLevel) {
        case 1:
        case "1":
            return "#ccff66";
        case 2:
        case "2":
            return "#ffff00";
        case 3:
        case "3":
            return "#ff9900";
        case 4:
        case "4":
            return "#ff0000";
        case 5:
        case "5":
            return "#9102ff";
        default:
            return "#95a5a6";
    }
}

function object2array(obj) {
  // {1: elem1, 2: elem2, ...} -> [elem1, elem2, ...]
  return $.map(obj, function (value, index) {
      return [value];
  });
}

function groupByDangers(data) {

  var preprocessedData = data.map(function(d) {
    var danger = d['Danger level'];
    return [danger ? danger[danger.length - 1] : danger, d.killed];
  }).filter(function (d) {
    return propertiesDangers.dangers.includes(d[0]);
  });

  var result = _.groupBy(preprocessedData, function (d) {
    return d[0]; 
  });
  result = _.map(result, function (d) {
    return {'danger': d[0][0], 'deaths': _.sum(_.map(d, function (x) {return x[1];}))};
  });
  return result;
}


function createDangers() {
  var parent = document.getElementById("graph-right");
  containerWidth = parent.clientWidth;
  containerHeight = 250;

  var margin = {
      top: 50,
      right: 30,
      bottom: 50,
      left: 50
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
      svg.selectAll(".bar").attr("opacity", 0.5);
    }
  
    function dragged() {
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
      dragged();

      if (propertiesDangers.filterName) {
        removeCurrentFilter()
        if (Math.abs(endDragY - startDragY) < 5) {
            return;
        }
      }

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
  
      var filterFunction = function (d) {
        var danger = d['Danger level'];
        if (!danger) {
          return false;
        }
        if (danger.length > 1) {
          danger = danger[danger.length - 1];
        }

        return danger >= fromIdx && danger < toIdx;
      };
  
      propertiesDangers.filterName = filterName;
      addFilter(filterName, filterFunction, removeCurrentFilter);
    }

    var svg = d3.select("#graph-right").append("svg")
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
    .text("Backcountry touring deaths");
  
  // add the y Axis
  svg.append("g")
  .call(d3.axisLeft(y))
  .attr('class', 'y-axis');

  propertiesDangers.y = y;
  propertiesDangers.svg = svg;
  propertiesDangers.width = width;
  propertiesDangers.height = height;
}

function updateDangers() {
  var height = propertiesDangers.height;
  var width = propertiesDangers.width;
  var svg = propertiesDangers.svg;
  var y = propertiesDangers.y;

  var data = [
    {'danger': 1, 'deaths': 2},
    {'danger': 2, 'deaths': 15}, 
    {'danger': 3, 'deaths': 12}, 
    {'danger': 4, 'deaths': 11}, 
    {'danger': 5, 'deaths': 8}, 
  ]

  var x = d3.scaleLinear()
    .range([0, width]);

  x.domain([0, maximumBoth]);


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

createDangers();
updateDangers();

var propertiesDangers = {
  dangers: ["5", "4", "3", "2", "1"],
};

function dangerColor(dangerLevel) {
    switch (dangerLevel) {
        case 1:
        case "1":
            return "#ccff66";
        case 2:
        case "2":
            return "#ffff00";
        case 3:
        case "3":
            return "#ff9900";
        case 4:
        case "4":
            return "#ff0000";
        case 5:
        case "5":
            return "#9102ff";
        default:
            return "#95a5a6";
    }
}

function groupByDangers(data) {

  var preprocessedData = data.map(function(d) {
    var danger = d['Danger level'];
    return [danger ? danger[danger.length - 1] : danger, d.killed];
  }).filter(function (d) {
    return propertiesDangers.dangers.includes(d[0]);
  });

  var result = _.groupBy(preprocessedData, function (d) {
    return d[0]; 
  });
  result = _.map(result, function (d) {
    return {'danger': d[0][0], 'deaths': _.sum(_.map(d, function (x) {return x[1];}))};
  });
  return result;
}


function createDangersLeft() {
  var parent = document.getElementById("graph-left");
  containerWidth = parent.clientWidth;
  containerHeight = 250;

  var margin = {
      top: 50,
      right: 20,
      bottom: 50,
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
      svg.selectAll(".bar").attr("opacity", 0.5);
    }
  
    function dragged() {
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
      dragged();

      if (propertiesDangers.filterName) {
        removeCurrentFilter()
        if (Math.abs(endDragY - startDragY) < 5) {
            return;
        }
      }

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
  
      var filterFunction = function (d) {
        var danger = d['Danger level'];
        if (!danger) {
          return false;
        }
        if (danger.length > 1) {
          danger = danger[danger.length - 1];
        }

        return danger >= fromIdx && danger < toIdx;
      };
  
      propertiesDangers.filterName = filterName;
      addFilter(filterName, filterFunction, removeCurrentFilter);
    }

    var svg = d3.select("#graph-left").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")")

  var y = d3.scaleBand()
    .range([0, height])
    .padding(0.1);
  
  y.domain(propertiesDangers.dangers);
  
  // // y axis label
  // svg.append("text")
  //   .attr("text-anchor", "middle")
  //   .attr("class", "histogram-label")
  //   .attr("transform", "translate("+ -30 +","+(height/2)+")rotate(-90)")
  //   .text("danger level");
  
  svg.append("text")
    .attr("text-anchor", "middle")
    .attr("class", "histogram-label")
    .attr("transform", "translate("+ (width/2) +","+(height + 20)+")")
    .text("Offpist skiing deaths");
  
  // add the y Axis
  svg.append("g")
  .call(d3.axisRight(y))
  .attr("transform", "translate("+ width +",0)")
  .attr('class', 'y-axis');

  propertiesDangers.y = y;
  propertiesDangers.svg = svg;
  propertiesDangers.width = width;
  propertiesDangers.height = height;
}

function updateDangersLeft() {
  var height = propertiesDangers.height;
  var width = propertiesDangers.width;
  var svg = propertiesDangers.svg;
  var y = propertiesDangers.y;

  var data = [
    {'danger': 1, 'deaths': 10},
    {'danger': 2, 'deaths': 15}, 
    {'danger': 3, 'deaths': 20}, 
    {'danger': 4, 'deaths': 25}, 
    {'danger': 5, 'deaths': 10}, 
  ]

  var x = d3.scaleLinear()
    .range([0, width]);

  x.domain([0, maximumBoth]);


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
      .attr("x", function (d) { return width - x(d.deaths) - 1; })
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
      return d.danger;
    });

  deathLabels.enter().append("text")
      .attr("text-anchor", "left")
      .attr("class", "histogram-label label")
      .attr("transform", function (d) {
        return "translate("+ (width - x(d.deaths) - 5) +","+(y(d.danger) + y.step() / 2)+")";
      })
      .text(function (d) {return d.deaths; })
    .merge(deathLabels)
      .transition().duration(500)
      .attr("transform", function (d) {
        return "translate("+ (width - x(d.deaths) - 5) +","+(y(d.danger) + y.step() / 2)+")";
      })
      .attr("text-anchor", "end")
      .text(function (d) {return d.deaths; });
  
  deathLabels.exit().remove();
}

createDangersLeft();
updateDangersLeft();
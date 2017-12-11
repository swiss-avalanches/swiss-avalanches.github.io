var propertiesMonth = {
  months: ["09", "10", "11", "12", "01", "02", "03", "04", "05", "06", "07", "08"],
  monthsName: ["Sept", "Oct", "Nov", "Dec", "Jan", "Feb", "March", "Apr", "May", "June", "July", "Aug"],
};

function removeUndef(data) {
  return _.omit(data, _.filter(_.keys(data), function (key) {
    return _.isUndefined(data[key]);
  }));
}

function groupByMonth(data) {
  data = removeUndef(data);

  function filterMonth(x) {
    var date = String(x.Date);
    var month = date.substring(3, 5);
    return month;
  }

  return _.countBy(_.map(data, filterMonth));
}


function createMonth(accidentsData, addFilter, removeFilter) {
  var parent = document.getElementById("month");
  containerWidth = parent.clientWidth;
  containerHeight = constants.componentHeight;

  var margin = {
      top: 20,
      right: 20,
      bottom: 30,
      left: 40
    },
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
      if (propertiesMonth.filterName) {
        // avoids infinite calls
        var toRemove = propertiesMonth.filterName;
        propertiesMonth.filterName = undefined;
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
        var idx = propertiesMonth.months.findIndex(function (x) { return x == d.month; });
        return idx >= fromIdx && idx < toIdx ? 1 : 0.5;
      });
    }
  
    function endDrag() {
      // filter name
      if (fromIdx + 1 == toIdx) {
        filterName = "Month " + propertiesMonth.monthsName[Math.min(0, fromIdx)];
      } else {
        filterName = "Months " + propertiesMonth.monthsName[Math.max(0, fromIdx)] + "-" + propertiesMonth.monthsName[Math.min(propertiesMonth.monthsName.length, toIdx) - 1];
      }
  
      var filterFunction = function (d) {
        var monthIdx = propertiesMonth.months.findIndex(function (x) {return x == d.Date.slice(3,5); });
        return monthIdx >= fromIdx && monthIdx < toIdx;
      };
  
      propertiesMonth.filterName = filterName;
      addFilter(filterName, filterFunction, removeCurrentFilter);
    }

    var svg = d3.select("#month").append("svg")
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

  var x = d3.scaleBand()
    .range([0, width])
    .padding(0.1);
  
  x.domain(propertiesMonth.months);
  
  // add the x Axis
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));
  
  // y axis label
  svg.append("text")
    .attr("text-anchor", "middle")
    .attr("class", "histogram-label")
    .attr("transform", "translate("+ -30 +","+(height/2)+")rotate(-90)")
    .text("accidents");
  
    // x axis label
  svg.append("text")
    .attr("text-anchor", "middle")
    .attr("class", "histogram-label")
    .attr("transform", "translate("+ (width/2) +","+(height + 30)+")")
    .text("month");

  propertiesMonth.x = x;
  propertiesMonth.svg = svg;
  propertiesMonth.width = width;
  propertiesMonth.height = height;
}

function updateMonth(accidentsData, addFilter, removeFilter) {
  var height = propertiesMonth.height;
  var width = propertiesMonth.width;
  var svg = propertiesMonth.svg;
  var x = propertiesMonth.x;

  var data = groupByMonth(accidentsData);

  var months = Object.keys(data);
  var accidents = Object.values(data);


  var newData = []

  for (var i = 0; i < months.length; ++i) {
    newData.push({
      month: months[i], //month: monthAccident,
      accident: accidents[i] //accident: numAccident
    });
  }


  var y = d3.scaleLinear()
    .range([height, 0]);

  y.domain([0, d3.max(newData, function (d) {
    return d.accident;
  })]);


  // append the rectangles for the bar chart
  var enterData = svg.selectAll(".bar")
    .data(newData, function (d) {
      return d.month;
    });

  enterData.enter().append("rect")
      .attr("class", "bar pass-through")
      .attr("fill", "#c0392b")
      .attr("width", x.bandwidth())
      .attr("x", function (d) {
        return x(d.month);
      })
      .attr("y", function (d) {
        return y(d.accident);
      })
      .attr("height", function (d) {
        return height - y(d.accident);
      })
    .merge(enterData)
      .transition().duration(500)
      .attr("y", function (d) {
        return y(d.accident);
      })
      .attr("height", function (d) {
        return height - y(d.accident);
      });

  enterData.exit().remove();

  svg.select('.y-axis').remove();

  // add the y Axis
  svg.append("g")
    .call(d3.axisLeft(y))
    .attr('class', 'y-axis');

}
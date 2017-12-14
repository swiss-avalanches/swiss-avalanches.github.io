var propertiesYears = {
  'firstYear': 2001,
  'lastYear': 2018,
};


function hydrologicalYear(datum) {
  var date = datum.Date;
  var month = parseInt(date.slice(3,5));
  var year = parseInt(date.slice(6,8));
  return 2000 + (month >= 9 ? year + 1 : year)
}

function createYears(accidentsData, addFilter, removeFilter) {
  var parent = document.getElementById("years");
  containerWidth = parent.clientWidth;
  containerHeight = constants.componentHeight;

  propertiesYears.years = _.range(propertiesYears.firstYear, propertiesYears.lastYear + 1)

  var margin = {top: 20, right: 20, bottom: 50, left: 30},
    width = containerWidth - margin.left - margin.right,
    height = containerHeight - margin.top - margin.bottom;
  
  propertiesYears.margin = margin

  /****** DRAG */


var dragStart = null;

var drag = d3.drag()
  .on("drag", dragged)
  .on("start", startDrag)
  .on("end", endDrag)

var removeCurrentFilter = function () {
  if (propertiesYears.filterName) {
    // avoids infinite calls
    var toRemove = propertiesYears.filterName
    propertiesYears.filterName = undefined;
    removeFilter(toRemove)
  }
  propertiesYears.svg.selectAll("rect").remove();
}

function startDrag() {
  dragStart = d3.event.x - propertiesYears.margin.left;
  removeCurrentFilter();

  propertiesYears.svg.append("rect")
    .attr("class", "selection")
    .attr("opacity", 0.5)
    .attr("fill", "#3498db")
    .attr("height", 20)
    .attr("width", 0)
    .attr("y", height)
    .attr("x", dragStart)
    .attr("width", 0)
    .on("click", removeCurrentFilter);
}

function dragged(d) {
  dragEnd = d3.event.x - propertiesYears.margin.left;

  var left = Math.min(dragStart, dragEnd),
    right = Math.max(dragStart, dragEnd),
    selectionWidth = right - left;

  propertiesYears.svg.selectAll("rect").attr("x", left).attr("width", selectionWidth)
}

function endDrag() {
  var left = Math.min(dragStart, dragEnd),
    right = Math.max(dragStart, dragEnd);
  
  var fromYear = Math.ceil(propertiesYears.x.invert(left)),
    toYear = Math.floor(propertiesYears.x.invert(right));

  toYear = Math.min(propertiesYears.lastYear, toYear);
  fromYear = Math.max(propertiesYears.firstYear, fromYear)
  
  if (toYear < fromYear) {
    propertiesYears.svg.selectAll("rect").remove();
    return;
  }

  if (fromYear == toYear) {
    filterName = "Year " + fromYear;
  } else {
    filterName = "Years " + fromYear + "-" + toYear;
  }

  var filterFunction = function (d) {
    return hydrologicalYear(d) >= fromYear && hydrologicalYear(d) <= toYear;
  };

  propertiesYears.filterName = filterName;
  addFilter(filterName, filterFunction, removeCurrentFilter)
}

  /****** END DRAG */

  var temp =  d3.select("#years").append("svg").call(drag).on('click', removeCurrentFilter);
  var svg = temp
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")")
  
  g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var x = d3.scaleLinear().range([0, width]);
  var y = d3.scaleLinear().range([height, 0]);

  x.domain([propertiesYears.firstYear, propertiesYears.lastYear]);

  // x axis label
  svg.append("text")
    .attr("text-anchor", "middle")
    .attr("class", "histogram-label")
    .attr("transform", "translate("+ (width/2) +","+(height + 35)+")")
    .text("hydrological year");
  
  
  // Add the X Axis
  svg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format("d")));

  // var maxY = d3.max(aggregationPerYear, function(d) {
  //   return d3.max([d.killed, d.caught, d.buried, d.accidents]); })
  y.domain([0, 55]);

  // Add the Y Axis
  svg.append("g")
    .call(d3.axisLeft(y));

  propertiesYears.x = x;
  propertiesYears.svg = svg;
  propertiesYears.width = width;
  propertiesYears.height = height;
  propertiesYears.y = y;
}

function updateYears(accidentsData, addFilter, removeFilter) {
  var height = propertiesYears.height;
  var width = propertiesYears.width;
  var svg = propertiesYears.svg;
  var x = propertiesYears.x;
  var y = propertiesYears.y;

  var aggregationPerYear = _(accidentsData).groupBy(hydrologicalYear).map(function (objs, key) {
    return {
      'year': +key,
      'killed': _.sumBy(objs, 'killed') | 0,
      'caught': _.sumBy(objs, 'caught') | 0,
      'buried': _.sumBy(objs, 'buried') | 0,
      'accidents': objs.length,
    };
  }).value();

  // TODO add zeros for default

  var lineKilled = d3.line()
    .curve(d3.curveBasis)
    .x(function(d) { return x(d.year); })
    .y(function(d) { return y(d.killed); });
  
  var lineBuried = d3.line()
    .curve(d3.curveBasis)
    .x(function(d) { return x(d.year); })
    .y(function(d) { return y(d.buried); });

  var lineAccidents = d3.line()
    .curve(d3.curveBasis)
    .x(function(d) { return x(d.year); })
    .y(function(d) { return y(d.accidents); });
    
  var lineCaught = d3.line()
    .curve(d3.curveBasis)
    .x(function(d) { return x(d.year); })
    .y(function(d) { return y(d.caught); });
  
  svg.selectAll(".dataLine").remove()

  var enterKilled = svg.selectAll(".killedLine").data([aggregationPerYear])
  
  enterKilled.enter().append("path")
      .attr("class", "dataLine killedLine")
      .attr('fill', 'none')
      .attr('stroke', constants.deathColor)
    .merge(enterKilled)
      .attr("d", lineKilled);

  enterKilled.exit().remove()
  
  var enterBuried = svg.selectAll(".buriedLine").data([aggregationPerYear])
  enterBuried.enter().append("path")
    .attr("class", "dataLine buriedLine")
    .attr('fill', 'none')
    .attr('stroke', constants.buriedColor)
  .merge(enterBuried)
    .attr("d", lineBuried);
  
  enterBuried.exit().remove()

  var enterAccident = svg.selectAll(".accidentLine").data([aggregationPerYear])
  enterAccident.enter().append("path")
    .attr("class", "dataLine accidentLine")
    .attr('fill', 'none')
    .attr('stroke', constants.accidentColor)
  .merge(enterAccident)
    .attr("d", lineAccidents);
    
    enterAccident.exit().remove()

  var enterCaught = svg.selectAll(".caughtLine").data([aggregationPerYear])
  enterCaught.enter().append("path")
    .attr("class", "dataLine caughtLine")
    .attr('fill', 'none')
    .attr('stroke', constants.caughtColor)
  .merge(enterCaught)
    .attr("d", lineCaught);
  
    enterCaught.exit().remove()


}
// better lines (with label)
// should add overlay
// how do we do selection ?

var propertiesPolar = {}

function createPolar(accidentsData, addFilter, removeFilter) {
  propertiesPolar.maxAltitude = 4500;
  propertiesPolar.minAltitude = 1000;
  propertiesPolar.width = 960
  propertiesPolar.height = 500,
  propertiesPolar.radius = Math.min(propertiesPolar.width, propertiesPolar.height) / 2 - 30;

  propertiesPolar.r = d3.scaleLinear()
    .domain([propertiesPolar.maxAltitude, propertiesPolar.minAltitude])
    .range([0, propertiesPolar.radius]);

  function angleFromCoord(x, y) {
    // cartesian not centered but with x right direction, y top direction
    // return theta in [0, 2pi] on trigonometric circle (start on the right and goes anti clock wise)
    var theta = Math.atan(Math.abs(y / x));
    if (x >= 0 && y >= 0) {  // cadran 1
      theta = theta
    } else if (x <= 0 && y >= 0) {  // cadran 2
      theta = Math.PI - theta
    } else if (x <= 0 && y <= 0) {  // cadran 3
      theta = Math.PI + theta;
    } else if (x >= 0 && y <= 0) {  // cadran 4
      theta = 2 * Math.PI - theta
    }

    return theta
  }

  var dragStartAngle = undefined,
    dragEndAngle = undefined;

  var drag = d3.drag()
    .on("drag", dragged)
    .on("start", startDrag)
    .on("end", endDrag)

  function startDrag() {
    var x = d3.event.x,
    y = - d3.event.y;
    var angle = (Math.PI - angleFromCoord(x, y)) - Math.PI / 2;
    dragStartAngle = angle;
    dragEndAngle = angle

    if (propertiesPolar.filterName) {
      removeFilter(propertiesPolar.filterName)
      propertiesPolar.filterName = undefined;
      d3.selectAll(".selection path").remove();
    }

    if (d3.selectAll(".selection path").size() == 0) {
      d3.selectAll(".selection").append("path")
        .attr("opacity", 0.5)
        .attr("fill", "#3498db")
        .on("click", function(){
          if (propertiesPolar.filterName) {
            removeFilter(propertiesPolar.filterName)
            propertiesPolar.filterName = undefined;
          }
          propertiesPolar.svg.selectAll(".selection").selectAll("*").remove();
        });
    }

    d3.selectAll(".selection path")
      .attr("d", arc([0, propertiesPolar.radius, dragStartAngle, dragEndAngle]));
  }

  function dragged(d) {
    var x = d3.event.x,
    y = - d3.event.y;
    var angle = (Math.PI - angleFromCoord(x, y)) - Math.PI / 2;
    var maxDelta = Math.PI + 0.1

    if (Math.abs(angle - dragEndAngle) < maxDelta) {
      dragEndAngle = angle;
    } else if (Math.abs(2 * Math.PI + angle - dragEndAngle) < maxDelta) {
      dragEndAngle = 2 * Math.PI + angle;
    } else if (Math.abs(-2 * Math.PI + angle - dragEndAngle) < maxDelta) {
      dragEndAngle = -2 * Math.PI + angle;
    }

    d3.selectAll(".selection path")
      .attr("d", arc([0, propertiesPolar.radius, dragStartAngle, dragEndAngle]));
  }

  function endDrag() {
    // TODO call addFilter
    var selectedAspects = aspectRangeAngle(dragStartAngle, dragEndAngle)
    console.log()
    if (selectedAspects.length == 0) {
      d3.selectAll(".selection path").remove()
      return;
    } if (selectedAspects.length == 1) {
      filterName = "Aspect " + selectedAspects[0]
    } else {
      filterName = "Aspect " + selectedAspects[0] + "-" + selectedAspects[selectedAspects.length - 1]
    }

    var filterFunction = function(d) {
      return selectedAspects.includes(d['Aspect'])
    }
    
    propertiesPolar.filterName = filterName
    addFilter(filterName, filterFunction)

    dragStartAngle = undefined;
    dragEndAngle = undefined;
  }

  propertiesPolar.svg = d3.select("#polar").append("svg")
    .attr("width", propertiesPolar.width)
    .attr("height", propertiesPolar.height)
    .append("g")
    .attr("transform", "translate(" + propertiesPolar.width / 2 + "," + propertiesPolar.height / 2 + ")")
  

  var arc = d3.arc()
    .innerRadius(function (d) { return d[0] })
    .outerRadius(function (d) { return d[1] })
    .startAngle(function (d) { return d[2] })
    .endAngle(function (d) { return d[3] });

  // full clickable cirle
  propertiesPolar.svg.append("g")
  .attr("class", "clickable")
  .append("path")
    .attr("d", arc([0, propertiesPolar.radius, 0, 2 * Math.PI]))
    .attr("fill", "white")
    .call(drag);

  var gr = propertiesPolar.svg.append("g")
    .attr("class", "r axis")
    .selectAll("g")
    .data(propertiesPolar.r.ticks(4).slice(1))
    .enter().append("g");

  gr.append("circle")
    .attr("r", propertiesPolar.r)
    .attr("fill", "none")
    .attr("stroke", "grey")
    .attr("stroke-width", "1px");

  var ga = propertiesPolar.svg.append("g")
    .attr("class", "a axis")
    .selectAll("g")
    .data(d3.range(0, 360, 30))
    .enter().append("g")
    .attr("transform", function(d) {
      return "rotate(" + -d + ")";
    });

  ga.append("line")
    .attr("x2", propertiesPolar.radius);

  propertiesPolar.svg.append("g")
    .attr("class", "selection")

  updatePolar(accidentsData, addFilter, removeFilter)
}


function updatePolar(data, addFilter, removeFilter) {
  var line = d3.radialLine()
    .radius(function(d) {
      return propertiesPolar.r(d[1]);
    })
    .angle(function(d) {
      return d[0];
    });

  var points = propertiesPolar.svg.selectAll(".point")
    .data(data, function(d) {
      return d.Date + ", " + d.Latitude + ", " + d.Longitude;
    });

  var pointsEnter = points.enter()
  
  pointsEnter.append("circle")
      .attr("class", "point")
      .attr("stroke", "white")
      .on('click', function (d) {
        console.log(d);
      })
      .attr("transform", function(d) {
        var angle = aspect(d['Aspect'], 'angle');
        var elevation = d['Elevation'];
        var coors = line([[angle, elevation]]).slice(1).slice(0, -1);
        return "translate(" + coors + ")"
      })
      .attr("r", function(d) {
        var killed = d['killed']
        return 3+4*killed
      })
      .attr("fill", function(d){
        return dangerColor(d['Danger level']);
      })
  
  points.exit().remove();
    
}
// better lines (with label)
// should add overlay
// how do we do selection ?

function createPolar() {
  var maxAltitude = 4500;
  var minAltitude = 1000;

  var width = 960,
    height = 500,
    radius = Math.min(width, height) / 2 - 30;

  var r = d3.scaleLinear()
    .domain([maxAltitude, minAltitude])
    .range([0, radius]);

  var line = d3.radialLine()
    .radius(function(d) {
      return r(d[1]);
    })
    .angle(function(d) {
      return d[0] - Math.PI ;
    });


  // function mousemove(d, i) {
  //   console.log(d3.mouse(this));
  // }

  var drag = d3.drag()
    .subject(function(d) { return d == null ? {x: d3.event.x, y: d3.event.y} : d; })
    .on("start", dragged);

  function dragged(d) {
    console.log(d3.event.x);
    d[0] = d3.event.x, d[1] = d3.event.y;
    // if (this.nextSibling) this.parentNode.appendChild(this);
    // d3.select(this).attr("transform", "translate(" + d + ")");
  }

  var svg = d3.select("#polar").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
    .call(drag);
    

  var gr = svg.append("g")
    .attr("class", "r axis")
    .selectAll("g")
    .data(r.ticks(4).slice(1))
    .enter().append("g");

  gr.append("circle")
    .attr("r", r)
    .attr("fill", "none")
    .attr("stroke", "grey")
    .attr("stroke-width", "1px");

  var ga = svg.append("g")
    .attr("class", "a axis")
    .selectAll("g")
    .data(d3.range(0, 360, 30))
    .enter().append("g")
    .attr("transform", function(d) {
      return "rotate(" + -d + ")";
    });

  ga.append("line")
    .attr("x2", radius);

  var arc = d3.arc()
    .innerRadius(function (d) { console.log(d, r(maxAltitude)); return d[0] })
    .outerRadius(function (d) { return d[1] })
    .startAngle(function (d) { return d[2] })
    .endAngle(function (d) { return d[3] });

  svg.append("g")
    .attr("class", "selection")
    .selectAll("g")
    .data([[0, r(minAltitude), - Math.PI / 2, 2 * Math.PI / 3]])
    .enter().append("path")
      .attr("d", arc)
      .attr("fill", "#3498db")
      .attr("opacity", 0.5)

  
  var color = d3.scaleOrdinal(d3.schemeCategory20);

  var line = d3.radialLine()
    .radius(function(d) {
      return r(d[1]);
    })
    .angle(function(d) {
      return d[0];
    });

  svg.selectAll("point")
    .data(accidentsData)
    .enter()
    .append("circle")
    .attr("class", "point")
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
    .attr("stroke", "white")
    .attr("fill", function(d){
      return dangerColor(d['Danger level']);
    })
    .on('click', function (d) {
      console.log(d);
    });
}
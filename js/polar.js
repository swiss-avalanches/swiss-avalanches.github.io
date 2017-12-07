function createPolar() {
  var width = 960,
    height = 500,
    radius = Math.min(width, height) / 2 - 30;

  var r = d3.scaleLinear()
    .domain([5000, 0])
    .range([0, radius]);

  var line = d3.radialLine()
    .radius(function(d) {
      return r(d[1]);
    })
    .angle(function(d) {
      return -d[0] + Math.PI / 2;
    });

  var svg = d3.select("#polar").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  var gr = svg.append("g")
    .attr("class", "r axis")
    .selectAll("g")
    .data(r.ticks(3).slice(1))
    .enter().append("g");

  gr.append("circle")
    .attr("r", r)
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", "2px");

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

  var color = d3.scaleOrdinal(d3.schemeCategory20);

  var line = d3.radialLine()
    .radius(function(d) {
      return r(d[1]);
    })
    .angle(function(d) {
      return -d[0] + Math.PI / 2;
    });

  var data = [
    [Math.PI / 3, Math.random()],
    [Math.PI / 6, Math.random()],
    [0 * Math.PI, Math.random()],
    [(11 * Math.PI) / 6, Math.random()],
    [(5 * Math.PI / 3), Math.random()],
    [(3 * Math.PI) / 2, Math.random()],
    [(4 * Math.PI / 3), Math.random()],
    [(7 * Math.PI) / 6, Math.random()],
    [Math.PI, Math.random()],
    [(5 * Math.PI) / 6, Math.random()],
    [(2 * Math.PI) / 3, Math.random()],
    [Math.PI / 2, Math.random()]
  ]
  console.log(accidentsData);

  svg.selectAll("point")
    .data(accidentsData)
    .enter()
    .append("circle")
    .attr("class", "point")
    .attr("transform", function(d) {
      var angle = aspect(d['Aspect'], 'angle');
      var altitude = Math.random() * 4000
      console.log(angle, altitude);
      var coors = line([[angle, altitude]]).slice(1).slice(0, -1);
      return "translate(" + coors + ")"
    })
    .attr("r", 5)
    .attr("fill", function(d){
      return dangerColor(d['Danger level']);
    });
}
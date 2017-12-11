var propertiesMonth = {};
var dictMonth = {
  "SEP": "09",
  "OCT": "10",
  "NOV": "11",
  "DEC": "12",
  "JAN": "01",
  "FEB": "02",
  "MAR": "03",
  "APR": "04",
  "MAY": "05",
  "JUN": "06",
  "JUL": "07",
  "AUG": "08"
};

/*[{"09": "SEP"},
    {"10": "OCT"}, 
    {"11": "NOV"},
    {"12": "DEC"}, 
    {"01": "JAN"}, 
    {"02": "FEB"},
    {"03": "MAR"},
    {"04": "APR"}, 
    {"05": "MAY"},
    {"06": "JUN"},
    {"07": "JUL"}, 
    {"08": "AUG"}];*/

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


  var svg = d3.select("#month").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

  var x = d3.scaleBand()
    .range([0, width])
    .padding(0.1);
  
  x.domain(["09", "10", "11", "12", "01", "02", "03", "04", "05", "06", "07", "08"]);
  
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

  var keyMonths = Object.keys(dictMonth);
  var valueMonths = Object.values(dictMonth);

  var newData = []

  for (var i = 0; i < months.length; ++i) { //dictMonth.length
    /*var monthAccident = keyMonths[i]; 
    console.log(monthAccident)
    var numAccident = 0;
    if (months.prototype.includes(valueMonths[i])){
        numAccident = accidents[months.indexOf(valueMonths[i])];
        console.log(numAccident)
    }*/
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
      .attr("class", "bar")
      .attr("fill", function (d, i) {
        return "#c0392b";
      })
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

  svg.select('.y-axis').remove();

  // add the y Axis
  svg.append("g")
    .call(d3.axisLeft(y))
    .attr('class', 'y-axis');

}
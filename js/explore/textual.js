var propertiesTextual = {};

function createTextual(accidentsData, addFilter, removeFilter, selectPoint) {

}

function updateTextual(accidentsData, addFilter, removeFilter, selectPoint) {
  var data = [
    { name: "accidents", value: accidentsData.length},
    { name: "deaths", value: _.sum(accidentsData.map(function (d) {return d.killed | 0}))},
    { name: "survival", value: 100. * _.sum(accidentsData.map(function (d) {return d.killed | 0})) / _.sum(accidentsData.map(function (d) {return d.caught | 0}))},
  ]

  function textualDescription(d) {
    switch (d.name) {
      case "accidents":
        return 'Number of accidents: ' + d.value;
      case "deaths":
        return 'Number of deaths: ' + d.value;
      case "survival":
        return 'Survival rate: ' + d.value.toFixed(1) + '%'
      default:
        throw "unknow textual type " + d.name
    }
  }

  var textuals = d3.select("#textual").selectAll(".textual-class")
    .data(data, function (d) {return d.name})
  
  textuals.enter()
      .append("div").attr("class", "one-third column").append("h4").attr("class", "textual-class")
    .merge(textuals)
      .text(textualDescription)
      .filter(function (d) { return  d.name == 'survival'; })
        .attr("data-step", "6")
        .attr("data-intro", "Be safe and have fun!")
}
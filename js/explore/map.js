var propertiesMap = {
  tabSelected: 'accidents',
};

function createMap(accidentsData, addFilter, removeFilter, selectPoint) {
  map = L.map('map').setView([46.875893, 8.289321], 7);

  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
  }).addTo(map);

  L.svg().addTo(map);

  propertiesMap.map = map;

  $("#dateRange").on('input', updateMapFromSlider);
}

function updateMapFromSlider() {
  var maps = propertiesMap.mapsByType[propertiesMap.tabSelected];
  index = +$("#dateRange").val();
  var currentDate = maps[index][0];
  var currentMapFeatures = maps[index][1];
  var dateFormated = "" + currentDate.slice(6, 8) + "." + currentDate.slice(4, 6) + "." + currentDate.slice(0, 4);
  $('#slide-date').text("Date: " + dateFormated)
  $('#original-url a').attr("href", currentMapFeatures.features[0].properties.url);

  if (propertiesMap.geojsonLayer) {
    propertiesMap.map.removeLayer(propertiesMap.geojsonLayer)
  }

  geojsonLayer = L.geoJSON(currentMapFeatures, { style: function(features) {
    var color = 'white';
    if (features.properties.danger_level) {
      color = dangerColor(features.properties.danger_level);
    } else if (features.properties.snow_level) {
      color = snowColor(features.properties.snow_level);
    }
    return {
      fillColor: color,
      color: 'none',
      fillOpacity: 0.7,
    }
  }});
  geojsonLayer.addTo(propertiesMap.map);
  propertiesMap.geojsonLayer = geojsonLayer;

  var svg = d3.select("#map").select("svg");
  var selectedPointData = accidentsData.find(function (d) { return d.id == selectedPoint; });

  var thePoint = svg.append("circle")
    .attr("class", "data-point")
    .attr("r", 8)
    .attr("stroke", "white")
    .attr("fill", "black")
    .attr("opacity", 0.7)
    .attr("stroke", "white")
    .attr("transform", "translate(" + map.latLngToLayerPoint(selectedPointData.LatLng).x + "," + map.latLngToLayerPoint(selectedPointData.LatLng).y + ")");

  
  function update() {
    thePoint.attr("transform", 
      "translate(" + map.latLngToLayerPoint(selectedPointData.LatLng).x + "," + map.latLngToLayerPoint(selectedPointData.LatLng).y + ")");
  }

  // move points to the right positions (continuously)
  map.on("moveend", update);
  map.on("zoomend", update);

  svg.classed("point-svg", true);
  $(".point-svg").parent().append($(".point-svg"))
}

function updateMap(data, addFilter, removeFilter, selectPoint) {
  map = propertiesMap.map;

  var svg = d3.select("#map").select("svg");

  if (propertiesMap.tabSelected != 'accidents') {
    svg.selectAll(".data-point").remove();
    updateMapFromSlider();
    return;
  } 

  $(".data-point").remove();

  data = data.filter(function (d) {
    return !isNaN(d.Latitude) && !isNaN(d.Longitude)
  });

  data.forEach(function (d) {
    d.LatLng = new L.LatLng(d.Latitude, d.Longitude)
  });

  function projectPoint(lat, long) {
    var point = map.latLngToLayerPoint(new L.LatLng(lat, long));
    this.stream.point(point.x, point.y);
  }


  var transform = d3.geoTransform({
    point: projectPoint
  });
  var path = d3.geoPath().projection(transform);

  if (propertiesMap.geojsonLayer) {
    propertiesMap.map.removeLayer(propertiesMap.geojsonLayer)
  }

  svg.selectAll(".data-point").remove();

  // $(".leaflet-overlay-pane div:first").insertAfter($(".leaflet-overlay-panediv:last"));
  
  var featureElement = svg.selectAll(".data-point")
    .data(data, function (p) {
      return p.id;
    });

  featureElement.enter()
    .append("circle")
    .attr("class", "data-point")
    .on('click', function (d) {
      selectPoint(d.id);
    })
    .attr("r", constants.killedRadius)
    .attr("stroke", "white")
    .attr("fill", function (d) {return d.color;})
    .merge(featureElement)
    .attr("opacity", function (d) {
      return d.selected ? 1 : 0.7;
    })
    .attr("stroke", function (d) {
      return d.selected ? '#2c3e50' : 'white';
    })
    .attr("transform",
      function (d) {
        return "translate(" + map.latLngToLayerPoint(d.LatLng).x + "," + map.latLngToLayerPoint(d.LatLng).y + ")";
      }
    )
    .sort(function (a, b) {
      if (a.selected == b.selected) {
        return 0;
      } else if (a.selected) {
        return 1;
      } else {
        return -1;
      }
    });

  featureElement.exit().remove();

  d3.select('.leaflet-pane svg').attr('pointer-events', 'visible');

  function update() {
    featureElement = svg.selectAll(".data-point")
    featureElement.attr("transform",
      function (d) {
        return "translate(" + map.latLngToLayerPoint(d.LatLng).x + "," + map.latLngToLayerPoint(d.LatLng).y + ")";
      }
    )
  }

  // move points to the right positions (continuously)
  map.on("moveend", update);
  map.on("zoomend", update);

}


function updateTabMap(allMaps) {
  d3.select("#tabs").selectAll("li").remove();

  if (! allMaps) {
    propertiesMap.tabSelected = 'accidents';
  } else {
    var mapsByType = _(allMaps).groupBy(function (d) { return d[0].split("_")[1]; }).value();
    propertiesMap.mapsByType = mapsByType;
    var tabsValue = _(mapsByType).keys().sortBy(prettyMapType).filter(function (d) {return d != 'hsrel'; }).value();

    if (!tabsValue.includes(propertiesMap.tabSelected)) {
      propertiesMap.tabSelected = 'accidents';
    }
  }

  if (propertiesMap.tabSelected != 'accidents') {
    var maps = propertiesMap.mapsByType[propertiesMap.tabSelected];
    $('#dateRange').attr('max', maps.length - 1);
  }

  d3.select("#tabs").insert("li")
      .classed("active", propertiesMap.tabSelected == 'accidents')
      .on('click', function (d) {
        if (propertiesMap.tabSelected != 'accidents') {
          propertiesMap.tabSelected = 'accidents';
          updateTabMap(allMaps);
        }
      })
    .insert('a')
      .attr('data-toggle', "tab")
      .text("Accidents");

  if (allMaps) {
    var tabs = d3.select("#tabs").selectAll(".custom-tab").data(tabsValue, function(d) {return d;});
  
    tabs.enter().insert('li')
        .classed('custom-tab', true)
        .classed("active", function (d) { return propertiesMap.tabSelected == d; })
        .on('click', function (d) {
          if (propertiesMap.tabSelected != d) {
            propertiesMap.tabSelected = d;
            updateTabMap(allMaps);  // TODO maybe problem old data
            // TODO update map
          }
        })
      .insert('a')
        .attr('data-toggle', "tab")
        .text(function (d,i) { return prettyMapType(d); });
  }

  d3.select('#slider-and-info').classed("hidden-stuff", propertiesMap.tabSelected  == 'accidents');
  d3.select('#original-url').classed("hidden-stuff", propertiesMap.tabSelected  == 'accidents');

  if ($(".leaflet-overlay-pane svg").length >= 2) {
    $(".leaflet-overlay-pane svg:last").remove();
  }

  updateMap(data, addFilter, removeFilter, selectPoint);
}
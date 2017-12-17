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
}


function updateMap(data, addFilter, removeFilter, selectPoint) {
  map = propertiesMap.map;

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

  var svg = d3.select("#map").select("svg");

  var transform = d3.geoTransform({
    point: projectPoint
  });
  var path = d3.geoPath().projection(transform);


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
    .attr("fill", function (d) {
      return dangerColor(d['Danger level']);
    })
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

  featureElement = svg.selectAll(".data-point")

  function update() {
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
    var tabsValue = _.sortBy(_.keys(mapsByType));

    if (!tabsValue.includes(propertiesMap.tabSelected)) {
      propertiesMap.tabSelected = 'accidents';
    }
  }

  d3.select("#tabs").insert("li")
      .classed("active", propertiesMap.tabSelected == 'accidents')
      .on('click', function (d) {
        if (propertiesMap.tabSelected != 'accidents') {
          propertiesMap.tabSelected = 'accidents';
          // TODO update map
        }
      })
    .insert('a')
      .attr('data-toggle', "tab")
      .text("Accidents");

  if (allMaps) {
    var tabs = d3.select("#tabs").selectAll("li").data(tabsValue);
  
    tabs.enter().insert('li')
        .classed("active", function (d) { return propertiesMap.tabSelected == d; })
        .on('click', function (d) {
          if (propertiesMap.tabSelected != d) {
            propertiesMap.tabSelected = d;
            // TODO update map
          }
        })
      .insert('a')
        .attr('data-toggle', "tab")
        .text(function (d) {return prettyMapType(d); });
  }
}
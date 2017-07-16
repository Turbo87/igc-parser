const tempWrite = require('temp-write');
const opn = require('opn');

function viewGeoJSON(json, bbox) {
  let html = `<html>
<head>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.1.0/dist/leaflet.css"/>
  <style>
  body { margin: 0; }
  #mapid { height: 180px; }
  </style>
</head>
<body id="map">
  <div id="mapid"></div>
  <script src="https://unpkg.com/leaflet@1.1.0/dist/leaflet.js"></script>
  <script src='https://unpkg.com/@turf/turf/turf.min.js'></script>   
  <script>
  var json = ${JSON.stringify(json)};
  var bbox = turf.bbox(json);
  
  var map = L.map('map').fitBounds([
    [bbox[1], bbox[0]],
    [bbox[3], bbox[2]],
  ]);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
  }).addTo(map);
  
  L.geoJSON(json, {
    style: function (feature) {
      return { 
        color: feature.properties.color || 'blue',
        opacity: feature.properties.opacity || 0.35,
      };
    }
  }).addTo(map);
  </script>
</body>
</html>`;

  let path = tempWrite.sync(html, 'map.html');

  opn(path, { wait: false });
}

module.exports = viewGeoJSON;
const viewGeoJSON = require('./src/view-geojson');

let json = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "stroke": "#5c1f14",
        "stroke-width": 2,
        "stroke-opacity": 1
      },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [
            61.17187499999999,
            55.97379820507658
          ],
          [
            27.0703125,
            31.353636941500987
          ],
          [
            45,
            26.43122806450644
          ]
        ]
      }
    }
  ]
};

viewGeoJSON(json);
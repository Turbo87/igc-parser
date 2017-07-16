const turf = require('@turf/turf');

const oz = require('./oz');

function taskToGeoJSON(task) {
  let legs = turf.lineString(task.points.map(pt => pt.location));

  let ozs = task.points.map((pt, i) => {
    if (pt.observationZone instanceof oz.Line) {
      return turf.lineString(pt.observationZone.coordinates);
    } else if (pt.observationZone instanceof oz.Cylinder) {
      return turf.circle(pt.observationZone.center, pt.observationZone.radius / 1000);
    }
  }).filter(Boolean);

  return turf.featureCollection([legs, ...ozs]);
}

module.exports = taskToGeoJSON;
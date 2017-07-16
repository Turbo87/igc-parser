const turf = require('@turf/turf');

const oz = require('./oz');

function taskToGeoJSON(task) {
  let legs = turf.lineString(task.points.map(pt => pt.location));

  let ozs = task.points.map((pt, i) => {
    let loc = pt.location;

    if (pt.observationZone instanceof oz.Line) {
      let p1 = turf.destination(loc, pt.observationZone.length / 2000, pt.observationZone.bearing + 90);
      let p2 = turf.destination(loc, pt.observationZone.length / 2000, pt.observationZone.bearing - 90);

      return turf.lineString([p1.geometry.coordinates, p2.geometry.coordinates]);

    } else if (pt.observationZone instanceof oz.Cylinder) {
      return turf.circle(pt.observationZone.center, pt.observationZone.radius / 1000);
    }
  }).filter(Boolean);

  return turf.featureCollection([legs, ...ozs]);
}

module.exports = taskToGeoJSON;
const turf = require('@turf/turf');

function taskToGeoJSON(task) {
  let legs = turf.lineString(task.points.map(pt => pt.waypoint.location));

  let ozs = task.points.map((pt, i) => {
    let loc = pt.waypoint.location;

    if (pt.observationZone.type === 'Line') {
      let bearing;
      if (i === 0) {
        let loc2 = task.points[i + 1].waypoint.location;
        bearing = turf.bearing(loc, loc2);

      } else if (i === task.points.length - 1) {
        let loc2 = task.points[i - 1].waypoint.location;
        bearing = turf.bearing(loc2, loc);

      } else {
        return;
      }

      let p1 = turf.destination(loc, pt.observationZone.length / 2000, bearing + 90);
      let p2 = turf.destination(loc, pt.observationZone.length / 2000, bearing - 90);

      return turf.lineString([p1.geometry.coordinates, p2.geometry.coordinates]);

    } else if (pt.observationZone.type === 'Cylinder') {
      return turf.circle(loc, pt.observationZone.radius / 1000);
    }
  }).filter(Boolean);

  return turf.featureCollection([legs, ...ozs]);
}

module.exports = taskToGeoJSON;
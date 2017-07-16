const turf = require('@turf/turf');

function analyzeFlight(flight, task) {
  let starts = [];

  let start_bearing = task.points[0].observationZone.bearing;
  let start_line = turf.lineString(task.points[0].observationZone.coordinates);

  for (let i = 0; i < flight.length - 1; i++) {
    let fix1 = flight[i];
    let fix2 = flight[i + 1];

    let intersection = turf.lineIntersect(start_line, turf.lineString([fix1, fix2]));
    if (intersection.features.length === 0) continue;

    let bearing = turf.bearing(fix1, fix2);
    let bearingDiff = turf.bearingToAngle(start_bearing - bearing);
    if (bearingDiff > 90 && bearingDiff < 270) continue;

    let point = intersection.features[0];
    starts.push({point, i});
  }

  return { starts };
}

module.exports = analyzeFlight;

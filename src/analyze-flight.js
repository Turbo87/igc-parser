const turf = require('@turf/turf');

function analyzeFlight(flight, task) {
  let starts = [];

  for (let i = 0; i < flight.length - 1; i++) {
    let fix1 = flight[i];
    let fix2 = flight[i + 1];

    let point = task.points[0].observationZone.checkEnter(fix1, fix2);
    if (point) {
      starts.push({point, i});
    }
  }

  return { starts };
}

module.exports = analyzeFlight;

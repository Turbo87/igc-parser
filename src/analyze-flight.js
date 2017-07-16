const turf = require('@turf/turf');

function analyzeFlight(flight, task) {
  let nextTP = 0;

  let start, finish;

  for (let i = 0; i < flight.length - 1; i++) {
    let fix1 = flight[i];
    let fix2 = flight[i + 1];

    if (nextTP < 2) {
      let point = task.points[0].observationZone.checkEnter(fix1, fix2);
      if (point) {
        nextTP = 1;
        start = {point, i};
      }
    }

    if (nextTP === task.points.length - 1) {
      let point = task.points[nextTP].observationZone.checkEnter(fix1, fix2);
      if (point) {
        nextTP += 1;
        finish = {point, i};
        break;
      }
    }

    let point = task.points[nextTP].observationZone.checkEnter(fix1, fix2);
    if (point) {
      nextTP += 1;
    }
  }

  return { start, finish };
}

module.exports = analyzeFlight;

const turf = require('@turf/turf');

function analyzeFlight(flight, task) {
  let nextTP = 0;

  let start, finish;

  for (let i = 0; i < flight.length - 1; i++) {
    let fix1 = flight[i].coordinate;
    let fix2 = flight[i + 1].coordinate;

    if (nextTP < 2) {
      let point = task.points[0].observationZone.checkEnter(fix1, fix2);
      if (point) {
        nextTP = 1;
        start = { point, i, secOfDay: flight[i].secOfDay };
      }
    }

    if (nextTP === task.points.length - 1) {
      let point = task.points[nextTP].observationZone.checkEnter(fix1, fix2);
      if (point) {
        nextTP += 1;
        finish = { point, i, secOfDay: flight[i].secOfDay };
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

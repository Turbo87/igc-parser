const turf = require('@turf/turf');

function analyzeFlight(flight, task) {
  let nextTP = 0;

  let start, finish;
  let aatPoints = [];

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

    if (nextTP > 1 && task.points[nextTP - 1].observationZone.isInside(fix1)) {
      let _score =
        turf.distance(fix1, task.points[nextTP - 2].location) +
        turf.distance(fix1, task.points[nextTP].location);

      let _lastScore = (aatPoints[nextTP - 1] && aatPoints[nextTP - 1]._score) || 0;
      if (_score > _lastScore) {
        aatPoints[nextTP - 1] = {_score, coordinate: fix1, i, secOfDay: flight[i].secOfDay};
      }
    }
  }

  let totalTime = finish.secOfDay - start.secOfDay;

  return { start, finish, totalTime, aatPoints };
}

module.exports = analyzeFlight;

const turf = require('@turf/turf');

function analyzeFlight(flight, task) {
  let nextTP = 0;

  let aatPoints = [];

  for (let i = 0; i < flight.length - 1; i++) {
    let fix1 = flight[i].coordinate;
    let fix2 = flight[i + 1].coordinate;

    if (nextTP < 2) {
      let point = task.points[0].observationZone.checkEnter(fix1, fix2);
      if (point) {
        aatPoints[0] = { coordinate: point.geometry.coordinates, i, secOfDay: flight[i].secOfDay};
        nextTP = 1;
      }
    }

    if (nextTP === task.points.length - 1) {
      let point = task.points[nextTP].observationZone.checkEnter(fix1, fix2);
      if (point) {
        aatPoints[nextTP] = { coordinate: point.geometry.coordinates, i, secOfDay: flight[i].secOfDay};
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

  let start = aatPoints[0];
  let finish = aatPoints[aatPoints.length - 1];
  let totalTime = finish.secOfDay - start.secOfDay;

  let distance = 0;
  for (let i = 0; i < aatPoints.length - 1; i++) {
    distance += turf.distance(aatPoints[i].coordinate, aatPoints[i + 1].coordinate);
  }

  let speed = distance / (totalTime / 3600);

  return { start, finish, totalTime, aatPoints, distance, speed };
}

module.exports = analyzeFlight;

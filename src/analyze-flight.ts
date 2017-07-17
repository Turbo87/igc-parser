import * as turf from "@turf/turf";

import {Fix} from "./read-flight";

class FlightAnalyzer {
  task: any;
  _lastFix: Fix | undefined;
  _nextTP = 0;
  _aatPoints: any[] = [];

  constructor(task) {
    this.task = task;
    this._lastFix = undefined;
    this._nextTP = 0;
    this._aatPoints = [];
  }

  update(fix: Fix) {
    if (!this._lastFix) {
      this._lastFix = fix;
      return;
    }

    if (this._nextTP >= this.task.points.length) {
      return;
    }

    if (this._nextTP < 2) {
      let point = this.task.points[0].observationZone.checkEnter(this._lastFix.coordinate, fix.coordinate);
      if (point) {
        this._aatPoints[0] = { coordinate: point.geometry.coordinates, secOfDay: fix.secOfDay};
        this._nextTP = 1;
      }
    }

    if (this._nextTP === this.task.points.length - 1) {
      let point = this.task.points[this._nextTP].observationZone.checkEnter(this._lastFix.coordinate, fix.coordinate);
      if (point) {
        this._aatPoints[this._nextTP] = { coordinate: point.geometry.coordinates, secOfDay: fix.secOfDay};
        this._nextTP += 1;
        return;
      }
    }

    let point = this.task.points[this._nextTP].observationZone.checkEnter(this._lastFix.coordinate, fix.coordinate);
    if (point) {
      this._nextTP += 1;
    }

    if (this._nextTP > 1 && this.task.points[this._nextTP - 1].observationZone.isInside(this._lastFix.coordinate)) {
      let _score =
        turf.distance(this._lastFix.coordinate, this.task.points[this._nextTP - 2].location) +
        turf.distance(this._lastFix.coordinate, this.task.points[this._nextTP].location);

      let _lastScore = (this._aatPoints[this._nextTP - 1] && this._aatPoints[this._nextTP - 1]._score) || 0;
      if (_score > _lastScore) {
        this._aatPoints[this._nextTP - 1] = {_score, coordinate: this._lastFix.coordinate, secOfDay: fix.secOfDay};
      }
    }

    this._lastFix = fix;
  }

  get result() {
    let start = this._aatPoints[0];
    let finish = this._aatPoints[this._aatPoints.length - 1];
    let totalTime = finish.secOfDay - start.secOfDay;

    let distance = 0;
    for (let i = 0; i < this._aatPoints.length - 1; i++) {
      distance += turf.distance(this._aatPoints[i].coordinate, this._aatPoints[i + 1].coordinate);
    }

    let speed = distance / (totalTime / 3600);

    return { start, finish, totalTime, aatPoints: this._aatPoints, distance, speed };
  }
}

export function analyzeFlight(flight: Fix[], task) {
  let analyzer = new FlightAnalyzer(task);

  flight.forEach(fix => analyzer.update(fix));

  return analyzer.result;
}

import * as turf from "@turf/turf";

import {Fix} from "./read-flight";
import {Task} from "./read-task";
import {Cylinder, Line, ObservationZone} from "./oz";
import {TakeoffDetector} from "./takeoff-detector";

class StartPoint {
  oz: ObservationZone;

  constructor(oz: ObservationZone) {
    this.oz = oz;
  }

  checkStart(c1: GeoJSON.Position, c2: GeoJSON.Position): GeoJSON.Feature<GeoJSON.Point> | undefined {
    if (this.oz instanceof Line) {
      return this.oz.checkEnter(c1, c2);
    }
    // TODO support start areas too
  }
}

class FinishPoint {
  oz: ObservationZone;

  constructor(oz: ObservationZone) {
    this.oz = oz;
  }

  checkFinish(c1: GeoJSON.Position, c2: GeoJSON.Position): GeoJSON.Feature<GeoJSON.Point> | undefined {
    if (this.oz instanceof Line) {
      return this.oz.checkEnter(c1, c2);
    }
    // TODO support finish areas too
  }
}

class TaskPoint {
  oz: ObservationZone;

  constructor(oz: ObservationZone) {
    this.oz = oz;
  }

  checkTransition(c1: GeoJSON.Position, c2: GeoJSON.Position): GeoJSON.Feature<GeoJSON.Point> | undefined {
    return this.oz.checkEnter(c1, c2);
  }
}

class FlightAnalyzer {
  task: Task;
  startPoint: StartPoint;
  finishPoint: FinishPoint;
  taskPoints: TaskPoint[];
  _lastFix: Fix | undefined;
  _nextTP = 0;
  _aatPoints: any[] = [];
  private _takeoffDetector = new TakeoffDetector();

  constructor(task: Task) {
    this.task = task;
    this.startPoint = new StartPoint(task.points.shift()!.observationZone);
    this.finishPoint = new FinishPoint(task.points.pop()!.observationZone);
    this.taskPoints = task.points.map(point => new TaskPoint(point.observationZone));
    this._lastFix = undefined;
    this._nextTP = 0;
    this._aatPoints = [];
  }

  update(fix: Fix) {
    this._takeoffDetector.update(fix);

    if (!this._lastFix) {
      this._lastFix = fix;
      return;
    }

    if (this._nextTP >= this.task.points.length) {
      return;
    }

    if (this._nextTP < 2) {
      let point = this.startPoint.checkStart(this._lastFix.coordinate, fix.coordinate);
      if (point) {
        this._aatPoints[0] = { coordinate: point.geometry.coordinates, secOfDay: fix.secOfDay};
        this._nextTP = 1;
      }
    }

    if (this._nextTP === this.task.points.length - 1) {
      let point = this.finishPoint.checkFinish(this._lastFix.coordinate, fix.coordinate);
      if (point) {
        this._aatPoints[this._nextTP] = { coordinate: point.geometry.coordinates, secOfDay: fix.secOfDay};
        this._nextTP += 1;
        return;
      }
    }

    let point = this.taskPoints[this._nextTP - 1].checkTransition(this._lastFix.coordinate, fix.coordinate);
    if (point) {
      this._nextTP += 1;
    }

    if (this._nextTP > 1 && (this.task.points[this._nextTP - 1].observationZone as Cylinder).isInside(this._lastFix.coordinate)) {
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

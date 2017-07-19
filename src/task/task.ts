import * as turf from '@turf/turf';
import * as cheapRuler from "cheap-ruler";

import {Turnpoint} from "../turnpoint";
import {FinishPoint, StartPoint} from "./task-points";
import Cylinder from "./shapes/cylinder";
import Point from "../geo/point";
import Line from "./shapes/line";
import {Fix} from "../read-flight";

export default class Task {
  points: Turnpoint[];
  options: TaskOptions;

  start: StartPoint;
  finish: FinishPoint;

  readonly legs: TaskLeg[];
  readonly distance: number;

  private readonly _ruler: cheapRuler.CheapRuler;

  constructor(points: Turnpoint[], options: TaskOptions) {
    this.points = points;
    this.options = options;

    this.start = new StartPoint(points[0].shape);
    this.finish = new FinishPoint(points[points.length - 1].shape);

    let center = turf.center(turf.multiPoint(points.map(point => point.shape.center)));
    this._ruler = cheapRuler(center.geometry.coordinates[1]);

    this.legs = [];
    for (let i = 1; i < points.length; i++) {
      let last = points[i - 1].shape.center;
      let current = points[i].shape.center;

      let distance = this._ruler.distance(last, current) * 1000;
      let bearing = this._ruler.bearing(last, current);

      this.legs.push({ distance, bearing });
    }

    this.distance = this._calcDistance();
  }

  checkStart(fix1: Fix, fix2: Fix): GeoJSON.Feature<GeoJSON.Point> | undefined {
    if (this.start.shape instanceof Line) {
      return this.start.shape.checkTransition(fix1, fix2);
    }
    // TODO support start areas too
  }

  checkFinish(fix1: Fix, fix2: Fix): GeoJSON.Feature<GeoJSON.Point> | undefined {
    if (this.finish.shape instanceof Line) {
      return this.finish.shape.checkTransition(fix1, fix2);
    } else if (this.finish.shape instanceof Cylinder) {
      return this.finish.shape.checkEnter(fix1.coordinate, fix2.coordinate);
    }
    // TODO support finish areas too
  }

  private _calcDistance() {
    // SC3a §6.3.1c
    //
    // The Task Distance is the distance from the Start Point to the Finish Point via
    // all assigned Turn Points, less the radius of the Start Ring (if used) and less
    // the radius of the Finish Ring (if used).

    let distance = this.legs.reduce((sum, leg) => sum + leg.distance, 0);

    if (this.start.shape instanceof Cylinder) {
      distance -= this.start.shape.radius;
    }

    if (this.finish.shape instanceof Cylinder) {
      distance -= this.finish.shape.radius;
    }

    return distance;
  }
}

export interface TaskOptions {
  isAAT: boolean,
  aatMinTime: number,
}

export interface TaskLeg {
  readonly distance: number; // meters
  readonly bearing: number;
}
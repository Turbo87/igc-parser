import * as turf from '@turf/turf';
import * as cheapRuler from "cheap-ruler";

import {Turnpoint} from "../turnpoint";
import {FinishPoint, StartPoint} from "./task-points";
import Cylinder from "./shapes/cylinder";

export default class Task {
  points: Turnpoint[];
  options: TaskOptions;

  start: StartPoint;
  finish: FinishPoint;

  readonly distance: number;

  private readonly _ruler: cheapRuler.CheapRuler;

  constructor(points: Turnpoint[], options: TaskOptions) {
    this.points = points;
    this.options = options;

    this.start = new StartPoint(points[0].shape);
    this.finish = new FinishPoint(points[points.length - 1].shape);

    let center = turf.center(turf.multiPoint(points.map(point => point.shape.center)));
    this._ruler = cheapRuler(center.geometry.coordinates[1]);

    this.distance = this._ruler.lineDistance(points.map(point => point.shape.center)) * 1000;

    if (this.start.shape instanceof Cylinder) {
      this.distance -= this.start.shape.radius;
    }

    if (this.finish.shape instanceof Cylinder) {
      this.distance -= this.finish.shape.radius;
    }
  }
}

export interface TaskOptions {
  isAAT: boolean,
  aatMinTime: number,
}

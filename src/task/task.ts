import * as turf from '@turf/turf';
import * as cheapRuler from "cheap-ruler";

import {Turnpoint} from "../turnpoint";
import {FinishPoint, StartPoint} from "./task-points";

export default class Task {
  points: Turnpoint[];
  options: TaskOptions;

  start: StartPoint;
  finish: FinishPoint;

  private readonly _ruler: cheapRuler.CheapRuler;

  constructor(points: Turnpoint[], options: TaskOptions) {
    this.points = points;
    this.options = options;

    this.start = new StartPoint(points[0].shape);
    this.finish = new FinishPoint(points[points.length - 1].shape);

    let center = turf.center(turf.multiPoint(points.map(point => point.shape.center)));
    this._ruler = cheapRuler(center.geometry.coordinates[1]);
  }
}

export interface TaskOptions {
  isAAT: boolean,
  aatMinTime: number,
}

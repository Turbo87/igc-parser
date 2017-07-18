import {Turnpoint} from "./turnpoint";
import {FinishPoint, StartPoint} from "./task-points";

export default class Task {
  points: Turnpoint[];
  options: TaskOptions;

  start: StartPoint;
  finish: FinishPoint;

  constructor(points: Turnpoint[], options: TaskOptions) {
    this.points = points;
    this.options = options;

    this.start = new StartPoint(points[0].observationZone);
    this.finish = new FinishPoint(points[points.length - 1].observationZone);
  }
}

export interface TaskOptions {
  isAAT: boolean,
  aatMinTime: number,
}

import {Turnpoint} from "./turnpoint";

export class Task {
  points: Turnpoint[];
  options: TaskOptions;

  constructor(points: Turnpoint[], options: TaskOptions) {
    this.points = points;
    this.options = options;
  }
}

export interface TaskOptions {
  isAAT: boolean,
  aatMinTime: number,
}

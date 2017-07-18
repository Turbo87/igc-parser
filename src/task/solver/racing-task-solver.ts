import {Fix} from "../../read-flight";
import Task from "../task";
import {Cylinder, Keyhole} from "../shapes";
import Point from "../../geo/point";

const Emitter = require('tiny-emitter');

interface TaskFix {
  time: number;
  point: Point;
}

export default class RacingTaskSolver {
  task: Task;

  readonly validStarts: TaskFix[] = [];

  private _lastFix: Fix | undefined = undefined;
  private _nextTP = 0;
  private _startTime: number | undefined;
  private _finishTime: number | undefined;

  private readonly _points: TaskFix[] = [];
  private readonly _emitter = new Emitter();

  constructor(task: Task) {
    this.task = task;
  }

  get reachedFirstTurnpoint(): boolean {
    return this._nextTP >= 2;
  }

  get onFinalLeg(): boolean {
    return this._nextTP === this.task.points.length - 1;
  }

  get taskFinished(): boolean {
    return this._nextTP >= this.task.points.length;
  }

  consume(fixes: Fix[]) {
    fixes.forEach(fix => this.update(fix));
  }

  update(fix: Fix) {
    if (this._lastFix) {
      this._update(fix, this._lastFix);
    }
    this._lastFix = fix;
  }

  _update(fix: Fix, lastFix: Fix) {
    if (this.taskFinished) {
      return;
    }

    if (!this.reachedFirstTurnpoint) {
      let point = this.task.start.checkStart(lastFix.coordinate, fix.coordinate);
      if (point) {
        this._points[0] = { time: fix.time, point: this.task.start.shape.center };
        this._nextTP = 1;
        this._startTime = fix.time; // TODO interpolate between fixes
        this.validStarts.push({ time: fix.time, point: fix.coordinate });
        this._emitter.emit('start', fix);
      }
    }

    if (this.onFinalLeg) {
      let point = this.task.finish.checkFinish(lastFix.coordinate, fix.coordinate);
      if (point) {
        this._points.push({ time: fix.time, point: this.task.finish.shape.center });
        this._nextTP += 1;
        this._finishTime = fix.time; // TODO interpolate between fixes
        this._emitter.emit('finish', fix);
        return;
      }
    }

    let entered = false;
    let { shape } = this.task.points[this._nextTP];
    if (shape instanceof Cylinder && !shape.isInside(lastFix.coordinate) && shape.isInside(fix.coordinate)) {
      entered = true;
    } else if (shape instanceof Keyhole && !shape.isInside(lastFix.coordinate) && shape.isInside(fix.coordinate)) {
      entered = true;
    }

    if (entered) {
      this._points.push({ time: fix.time, point: shape.center });
      this._nextTP += 1;
      this._emitter.emit('turn', fix, this._nextTP - 1);
    }
  }

  get result(): any {
    return {
      points: this._points,
      validStarts: this.validStarts,
    }
  }

  on(event: string, handler: Function) {
    return this._emitter.on(event, handler);
  }
}

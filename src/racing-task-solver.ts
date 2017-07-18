import {Fix} from "./read-flight";
import Task from "./task";
import {Cylinder, Keyhole, Line} from "./oz";

const Emitter = require('tiny-emitter');

export default class RacingTaskSolver {
  task: Task;

  private _lastFix: Fix | undefined = undefined;
  private _nextTP = 0;

  private readonly _points: Fix[] = [];
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
        this._points[0] = fix;
        this._nextTP = 1;
        this._emitter.emit('start', fix);
      }
    }

    if (this.onFinalLeg) {
      let point = this.task.finish.checkFinish(lastFix.coordinate, fix.coordinate);
      if (point) {
        this._points[this._nextTP] = fix;
        this._nextTP += 1;
        this._emitter.emit('finish', fix);
        return;
      }
    }

    let entered = false;
    let oz = this.task.points[this._nextTP].observationZone;
    if (oz instanceof Line && oz.checkEnter(lastFix.coordinate, fix.coordinate)) {
      entered = true;
    } else if (oz instanceof Cylinder && oz.checkEnter(lastFix.coordinate, fix.coordinate)) {
      entered = true;
    } else if (oz instanceof Keyhole && !oz.isInside(lastFix.coordinate) && oz.isInside(fix.coordinate)) {
      entered = true;
    }

    if (entered) {
      this._points[this._nextTP] = fix;
      this._nextTP += 1;
      this._emitter.emit('turn', fix, this._nextTP - 1);
    }
  }

  get result(): any {
    return {
      points: this._points,
    }
  }

  on(event: string, handler: Function) {
    return this._emitter.on(event, handler);
  }
}

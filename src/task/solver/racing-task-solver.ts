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

  validStarts: TaskFix[] = [];
  turns: TaskFix[] = [];
  finish: TaskFix | undefined;

  // the "Marking Distance" according to SC3a §6.3.1 (meters)
  distance = 0;

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
        this.finish = { time: fix.time, point: fix.coordinate };

        // SC3a §6.3.1d (i)
        //
        // For a completed task, the Marking Distance is the Task Distance.

        this.distance = this.task.distance;

        this._emitter.emit('finish', fix);
        return;
      }
    }

    // SC3a §6.3.1b
    //
    // A Turn Point is achieved by entering that Turn Point's Observation Zone.

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
      this.turns.push({ time: fix.time, point: fix.coordinate });
      this._emitter.emit('turn', fix, this._nextTP - 1);
    }
  }

  get result(): any {
    return {
      validStarts: this.validStarts,
      turns: this.turns,
      finish: this.finish,
      completed: this.completed,
      time: this.time,
      distance: this.distance,
    }
  }

  get completed(): boolean {
    // SC3a §6.3.1b
    //
    // The task is completed when the competitor makes a valid Start, achieves
    // each Turn Point in the designated sequence, and makes a valid Finish.

    return this.validStarts.length > 0 &&
      this.turns.length === this.task.points.length - 2 &&
      this.finish !== undefined;
  }

  get time(): number | undefined {
    // SC3a §6.3.1d (iv)
    //
    // For finishers, the Marking Time is the time elapsed between the most
    // favorable valid Start Time and the Finish Time. For non-finishers the
    // Marking Time is undefined.

    if (this.completed) {
      let lastStart = this.validStarts[this.validStarts.length - 1];
      return Math.round((this.finish!.time - lastStart.time) / 1000);
    }
  }

  on(event: string, handler: Function) {
    return this._emitter.on(event, handler);
  }
}

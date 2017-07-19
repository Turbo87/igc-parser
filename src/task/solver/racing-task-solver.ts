import * as turf from "@turf/turf";

import {Fix} from "../../read-flight";
import Task from "../task";
import Point from "../../geo/point";
import AreaShape from "../shapes/area";
import {Event, FinishEvent, StartEvent, TurnEvent} from "../events";

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
  events: Event[] = [];

  private _lastFix: Fix | undefined = undefined;
  private _nextTP = 0;
  private _legDistance = 0;
  private _legFix: TaskFix | undefined;

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
      let point = this.task.checkStart(lastFix.coordinate, fix.coordinate);
      if (point) {
        this._nextTP = 1;
        this.validStarts.push({ time: fix.time, point: fix.coordinate }); // TODO interpolate between fixes
        this._legDistance = 0;
        this.emitEvent(new StartEvent(fix));
      }
    }

    if (this.onFinalLeg) {
      let point = this.task.checkFinish(lastFix.coordinate, fix.coordinate);
      if (point) {
        this._nextTP += 1;
        this.finish = { time: fix.time, point: fix.coordinate }; // TODO interpolate between fixes
        this.emitEvent(new FinishEvent(fix));
        return;
      }
    }

    // SC3a §6.3.1b
    //
    // A Turn Point is achieved by entering that Turn Point's Observation Zone.

    let entered = false;
    let { shape } = this.task.points[this._nextTP];
    if (shape instanceof AreaShape && !shape.isInside(lastFix.coordinate) && shape.isInside(fix.coordinate)) {
      entered = true;
    }

    if (entered) {
      this._nextTP += 1;
      this.turns.push({ time: fix.time, point: fix.coordinate });
      this._legDistance = 0;
      this.emitEvent(new TurnEvent(fix, this._nextTP - 1));
    }

    let nextTP = this.task.points[this._nextTP];
    let lastTP = this.task.points[this._nextTP - 1];
    if (nextTP && lastTP) {
      let legDistance = turf.distance(lastTP.shape.center, nextTP.shape.center) - turf.distance(fix.coordinate, nextTP.shape.center);
      if (legDistance > this._legDistance) {
        this._legDistance = legDistance;
        this._legFix = { time: fix.time, point: fix.coordinate };
      }
    }
  }

  get result(): any {
    let time = this.time;
    let distance = this.distance;

    // SC3a §6.3.1d (v)
    //
    // For finishers, the Marking Speed is the Marking Distance divided by the
    // Marking Time. For non-finishers the Marking Speed is zero.

    let speed = (time !== undefined && distance !== undefined) ? (distance / 1000) / (time / 3600) : undefined;

    return {
      validStarts: this.validStarts,
      turns: this.turns,
      finish: this.finish,
      completed: this.completed,
      time,
      distance,
      speed,
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

  // the "Marking Distance" according to SC3a §6.3.1 (meters)
  get distance(): number | undefined {

    // SC3a §6.3.1d (i)
    //
    // For a completed task, the Marking Distance is the Task Distance.

    if (this.completed) {
      return this.task.distance;
    }

    let reachedPoints = this.task.points.slice(0, this.turns.length + 1);
    let reachedPointsDistance = turf.lineDistance(turf.lineString(reachedPoints.map(point => point.shape.center)));
    return (reachedPointsDistance + this._legDistance) * 1000;
  }

  emitEvent(event: Event) {
    this.events.push(event);
    this._emitter.emit(event.type, event);
  }

  on(event: string, handler: (event: Event) => any) {
    return this._emitter.on(event, handler);
  }
}

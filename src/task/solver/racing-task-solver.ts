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

  events: Event[] = [];

  private _lastFix: Fix | undefined = undefined;
  private _nextTP = 0;
  private _maxDistance = 0;
  private _maxDistanceFix: TaskFix | undefined;

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
    let start = this.task.checkStart(lastFix, fix);
    if (start) {
      this.emitEvent(new StartEvent(fix));
    }

    for (let i = 1; i < this.task.points.length - 1; i++) {
      let prevTPReached = this.events.some(i === 1 ?
        (event => event instanceof StartEvent) :
        (event => event instanceof TurnEvent && event.num === i - 1));

      if (prevTPReached) {
        // SC3a §6.3.1b
        //
        // A Turn Point is achieved by entering that Turn Point's Observation Zone.

        let tp = this.task.points[i];
        if (tp.shape instanceof AreaShape && !tp.shape.isInside(lastFix.coordinate) && tp.shape.isInside(fix.coordinate)) {
          this.emitEvent(new TurnEvent(fix, i));
        }
      }
    }

    let lastTPReached = this.events.some(event => event instanceof TurnEvent && event.num === this.task.points.length - 2);
    if (lastTPReached) {
      let finish = this.task.checkFinish(lastFix, fix);
      if (finish) {
        this.emitEvent(new FinishEvent(fix));
      }
    }

    if (this.taskFinished) {
      return;
    }

    if (!this.reachedFirstTurnpoint) {
      let point = this.task.checkStart(lastFix, fix);
      if (point) {
        this._nextTP = 1;
      }
    }

    if (this.onFinalLeg) {
      let point = this.task.checkFinish(lastFix, fix);
      if (point) {
        this._nextTP += 1;
        return;
      }
    }

    let { shape } = this.task.points[this._nextTP];
    if (shape instanceof AreaShape && !shape.isInside(lastFix.coordinate) && shape.isInside(fix.coordinate)) {
      this._nextTP += 1;
    }

    if (this._nextTP > 0) {
      let nextTP = this.task.points[this._nextTP];

      // SC3a §6.3.1d (ii)
      //
      // If the competitor has outlanded on the last leg, the Marking Distance is
      // the distance from the Start Point, less the radius of the Start Ring (if
      // used), through each Turn Point to the Finish point, less the distance from
      // the Outlanding Position to the Finish Point. If the achieved distance on
      // the last leg is less than zero, it shall be taken as zero.

      // SC3a §6.3.1d (iii)
      //
      // If the competitor has outlanded on any other leg, the Marking Distance
      // is the distance from the Start Point, less the radius of the Start Ring (if
      // used), through each Turn Point achieved plus the distance achieved on
      // the uncompleted leg. The achieved distance of the uncompleted leg is the
      // length of that leg less the distance between the Outlanding Position and
      // the next Turn Point. If the achieved distance of the uncompleted leg is
      // less than zero, it shall be taken as zero.

      let finishedLegs = this.task.legs.slice(0, Math.max(...this.events.filter(event => event instanceof TurnEvent).map((event: TurnEvent) => event.num)));
      let finishedLegsDistance = finishedLegs.reduce((sum, leg) => sum + leg.distance, 0);
      let currentLegDistance = this.task.legs[this._nextTP - 1].distance - this.task.measureDistance(fix.coordinate, nextTP.shape.center) * 1000;
      let maxDistance = finishedLegsDistance + currentLegDistance;
      if (maxDistance > this._maxDistance) {
        this._maxDistance = maxDistance;
        this._maxDistanceFix = { time: fix.time, point: fix.coordinate };
      }
    }
  }

  get result(): any {
    // SC3a §6.3.1b
    //
    // The task is completed when the competitor makes a valid Start, achieves
    // each Turn Point in the designated sequence, and makes a valid Finish.

    // FinishEvent is only added when last TP has been reached which simplifies the check here
    let completed = this.events.some(event => event instanceof FinishEvent);

    // SC3a §6.3.1d (i)
    //
    // For a completed task, the Marking Distance is the Task Distance.

    let distance = completed ? this.task.distance : this._maxDistance;

    // SC3a §6.3.1d (iv)
    //
    // For finishers, the Marking Time is the time elapsed between the most
    // favorable valid Start Time and the Finish Time. For non-finishers the
    // Marking Time is undefined.

    let time;
    if (completed) {
      let lastStart = this.events.filter(event => event instanceof StartEvent).pop()!;
      let finish = this.events.filter(event => event instanceof FinishEvent).pop()!;
      time = Math.round((finish.time - lastStart.time) / 1000);
    }

    // SC3a §6.3.1d (v)
    //
    // For finishers, the Marking Speed is the Marking Distance divided by the
    // Marking Time. For non-finishers the Marking Speed is zero.

    let speed = (time !== undefined && distance !== undefined) ? (distance / 1000) / (time / 3600) : undefined;

    return {
      completed,
      time,
      distance,
      speed,
    }
  }

  emitEvent(event: Event) {
    this.events.push(event);
    this._emitter.emit(event.type, event);
  }

  on(event: string, handler: (event: Event) => any) {
    return this._emitter.on(event, handler);
  }
}

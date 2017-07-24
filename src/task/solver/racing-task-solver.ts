import {Fix} from "../../read-flight";
import Task from "../task";
import Point from "../../geo/point";
import {Event, FinishEvent, StartEvent, TurnEvent} from "../events";
import TaskPointTracker from "../task-point-tracker";

export interface TaskFix {
  time: number;
  point: Point;
}

export default class RacingTaskSolver {
  task: Task;

  private _tracker: TaskPointTracker;

  private _maxDistance = 0;
  private _maxDistanceFix: TaskFix | undefined;

  constructor(task: Task) {
    this.task = task;
    this._tracker = new TaskPointTracker(task, { trackConvexHull: false });
  }

  get events() {
    return this._tracker.events;
  }

  get taskStarted(): boolean {
    return this._tracker.hasStart;
  }

  get taskFinished(): boolean {
    return this._tracker.hasFinish;
  }

  consume(fixes: Fix[]) {
    fixes.forEach(fix => this.update(fix));
  }

  update(fix: Fix) {
    this._tracker.update(fix);

    let legIndex = this._tracker.currentLegIndex;
    if (legIndex === null) {
      return;
    }

    let nextTP = this.task.points[legIndex + 1];

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

    let finishedLegs = this.task.legs.slice(0, legIndex);
    let finishedLegsDistance = finishedLegs.reduce((sum, leg) => sum + leg.distance, 0);
    let currentLegDistance = this.task.legs[legIndex].distance - this.task.measureDistance(fix.coordinate, nextTP.shape.center) * 1000;
    let maxDistance = finishedLegsDistance + currentLegDistance;
    if (maxDistance > this._maxDistance) {
      this._maxDistance = maxDistance;
      this._maxDistanceFix = { time: fix.time, point: fix.coordinate };
    }
  }

  get result(): any {
    // SC3a §6.3.1b
    //
    // The task is completed when the competitor makes a valid Start, achieves
    // each Turn Point in the designated sequence, and makes a valid Finish.

    // FinishEvent is only added when last TP has been reached which simplifies the check here
    let completed = this.taskFinished;

    // SC3a §6.3.1d (i)
    //
    // For a completed task, the Marking Distance is the Task Distance.

    let distance = completed ? this.task.distance : this._maxDistance;

    // SC3a §6.3.1d (iv)
    //
    // For finishers, the Marking Time is the time elapsed between the most
    // favorable valid Start Time and the Finish Time. For non-finishers the
    // Marking Time is undefined.

    let path = this.events
      .filter(event => event instanceof StartEvent)
      .map(event => pathForStart(event, this.events))
      .sort(sortEventPaths)
      .shift();

    let time = path && path.time;

    // SC3a §6.3.1d (v)
    //
    // For finishers, the Marking Speed is the Marking Distance divided by the
    // Marking Time. For non-finishers the Marking Speed is zero.

    let speed = completed ? (distance as number / 1000) / (time as number / 3600) : undefined;

    return {
      path: path ? path.path : [],
      completed,
      time,
      distance,
      speed,
    }
  }
}

export function pathForStart(start: StartEvent, events: Event[]): EventPath {
  let path: Event[] = [start];
  let time;

  for (let i = events.indexOf(start) + 1; i < events.length; i++) {
    let event = events[i];
    if (event instanceof TurnEvent && event.num === path.length) {
      path.push(event);
    } else if (event instanceof FinishEvent) {
      path.push(event);
      time = (event.time - start.time) / 1000;
    }
  }

  return { path, time };
}

interface EventPath {
  path: Event[];
  time: number | undefined;
}

function sortEventPaths(a: EventPath, b: EventPath) {
  if (a.time !== undefined && b.time !== undefined)
    return a.time - b.time;

  if (a.time !== undefined && b.time === undefined)
    return -1;

  if (a.time === undefined && b.time !== undefined)
    return 1;

  return b.path.length - a.path.length;
}

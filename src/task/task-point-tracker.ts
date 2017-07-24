import Task from "./task";
import {Fix} from "../read-flight";
import Event from "./events/event";
import StartEvent from "./events/start";
import FinishEvent from "./events/finish";
import TurnEvent from "./events/turn";
import {interpolateFix} from "../utils/interpolate-fix";
import AreaShape from "./shapes/area";

interface AreaVisit {
  enter: Fix;
  exit: Fix | null;
}

export default class TaskPointTracker {
  task: Task;

  starts: Fix[] = [];
  events: Event[] = [];
  areaVisits: AreaVisit[][];
  finish: Fix | null = null;

  private _lastFix: Fix | undefined = undefined;
  private readonly _areas: AreaShape[];

  constructor(task: Task) {
    this.task = task;

    this._areas = this.task.points.slice(1, task.points.length - 1).map(p => p.shape as AreaShape);
    this.areaVisits = this._areas.map(() => []);
  }

  get hasStart() {
    return this.starts.length > 0;
  }

  hasVisitedArea(num: number) {
    return this.events.some(event => event instanceof TurnEvent && event.num === num);
  }

  get hasFinish() {
    return this.finish !== null;
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
    if (start !== undefined) {
      let startFix = interpolateFix(lastFix, fix, start);
      this.events.push(new StartEvent(startFix));
      this.starts.push(startFix);
    }

    for (let i = 0; i < this._areas.length; i++) {
      let prevTPReached = (i === 0) ? this.hasStart : this.hasVisitedArea(i);
      if (!prevTPReached)
        continue;

      let shape = this._areas[i];
      let areaVisits = this.areaVisits[i];

      // SC3a §6.3.1b
      //
      // A Turn Point is achieved by entering that Turn Point's Observation Zone.

      let fractions = shape.findIntersections(lastFix.coordinate, fix.coordinate);
      if (fractions.length === 0)
        continue;

      let isInside = shape.isInside(lastFix.coordinate);
      for (let j = 0; j < fractions.length; j++) {
        isInside = !isInside;

        let fraction = fractions[j];
        let intersectionFix = interpolateFix(lastFix, fix, fraction);

        if (isInside) {
          this.events.push(new TurnEvent(intersectionFix, i + 1));
          areaVisits.push({ enter: intersectionFix, exit: null });
        } else {
          areaVisits[areaVisits.length - 1].exit = intersectionFix;
        }
      }
    }

    let lastTPReached = this.hasVisitedArea(this._areas.length);
    if (lastTPReached) {
      let finish = this.task.checkFinish(lastFix, fix);
      if (finish !== undefined) {
        let finishFix = interpolateFix(lastFix, fix, finish);
        this.events.push(new FinishEvent(finishFix));
        this.finish = finishFix;
      }
    }
  }
}

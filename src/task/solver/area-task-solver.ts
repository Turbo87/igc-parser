import {Fix} from "../../read-flight";
import Task from "../task";
import AreaShape from "../shapes/area";

export default class AreaTaskSolver {
  task: Task;

  private _lastFix: Fix | undefined = undefined;
  private _areas: Array<Fix[]> = [];

  constructor(task: Task) {
    this.task = task;

    for (let i = 1; i < this.task.points.length - 1; i++) {
      this._areas[i] = [];
    }
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
    for (let i = 1; i < this.task.points.length - 1; i++) {
      let tp = this.task.points[i];
      if (tp.shape instanceof AreaShape && tp.shape.isInside(fix.coordinate)) {
        this._areas[i].push(fix);
      }
    }
  }

  get result() {
    return this._areas.map(it => it.length);
  }
}

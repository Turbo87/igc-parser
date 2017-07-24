import {Fix} from "../../read-flight";
import Task from "../task";

export default class AreaTaskSolver {
  task: Task;

  private _lastFix: Fix | undefined = undefined;

  constructor(task: Task) {
    this.task = task;
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
  }
}

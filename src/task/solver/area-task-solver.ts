import {Fix} from "../../read-flight";
import Task from "../task";
import TaskPointTracker from "../task-point-tracker";

export default class AreaTaskSolver {
  task: Task;

  private _tracker: TaskPointTracker;

  constructor(task: Task) {
    this.task = task;
    this._tracker = new TaskPointTracker(task, { trackConvexHull: true });
  }

  consume(fixes: Fix[]) {
    fixes.forEach(fix => this.update(fix));
  }

  update(fix: Fix) {
    this._tracker.update(fix);
  }

  get result() {
    return null;
  }
}

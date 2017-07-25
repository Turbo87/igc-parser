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
    if (!this._tracker.hasFinish)
      return null;

    let areaFixes: Fix[][] = this._tracker.areaVisits.map(areaVisits => {
      return areaVisits.map(visit => visit.fixes).reduce((array, fixes) => array.concat(fixes), []);
    });

    let graph = Object.create(null);

    this._tracker.starts.forEach((start, i) => {
      let startKey = `s-${i}`;
      graph[startKey] = Object.create(null);

      areaFixes[0].forEach((fix, j) => {
        let areaKey = `0-${j}`;
        graph[startKey][areaKey] = -this.task.measureDistance(start.coordinate, fix.coordinate);
      });
    });

    areaFixes.forEach((fixes, i) => {
      if (i === areaFixes.length - 1) {
        fixes.forEach((fix, j) => {
          let areaKey = `${i}-${j}`;
          graph[areaKey] = Object.create(null);
          graph[areaKey]['f'] = -this.task.measureDistance(fix.coordinate, this._tracker.finish!.coordinate);
        });
      } else {
        let nextAreaFixes = areaFixes[i + 1];
        fixes.forEach((fix1, j) => {
          let area1Key = `${i}-${j}`;
          graph[area1Key] = Object.create(null);

          nextAreaFixes.forEach((fix2, k) => {
            let area2Key = `${i + 1}-${k}`;
            graph[area1Key][area2Key] = -this.task.measureDistance(fix1.coordinate, fix2.coordinate);
          })
        })
      }
    });

    return graph;
  }
}

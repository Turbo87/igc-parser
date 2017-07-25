import {Fix} from "../../read-flight";
import Task from "../task";
import TaskPointTracker from "../task-point-tracker";

const Graph = require('node-dijkstra')

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

    let graph = new Graph();
    let fixMap = Object.create(null);

    fixMap['f'] = this._tracker.finish;

    this._tracker.starts.forEach((start, i) => {
      let edges: any = {};
      areaFixes[0].forEach((fix, j) => {
        let areaKey = `0-${j}`;
        edges[areaKey] = 10000-this.task.measureDistance(start.coordinate, fix.coordinate);
      });

      graph.addNode(`s-${i}`, edges);
      fixMap[`s-${i}`] = start;
    });

    areaFixes.forEach((fixes, i) => {
      if (i === areaFixes.length - 1) {
        fixes.forEach((fix, j) => {
          graph.addNode(`${i}-${j}`, {
            f: 10000-this.task.measureDistance(fix.coordinate, this._tracker.finish!.coordinate),
          });
          fixMap[`${i}-${j}`] = fix;
        });
      } else {
        let nextAreaFixes = areaFixes[i + 1];
        fixes.forEach((fix1, j) => {
          let edges: any = {};
          nextAreaFixes.forEach((fix2, k) => {
            let area2Key = `${i + 1}-${k}`;
            edges[area2Key] = 10000-this.task.measureDistance(fix1.coordinate, fix2.coordinate);
          });

          graph.addNode(`${i}-${j}`, edges);
          fixMap[`${i}-${j}`] = fix1;
        })
      }
    });

    let result = graph.path('s-0', 'f', { cost: true });

    let path = result.path.map((key: string) => fixMap[key]!) as Fix[];

    return { path, distance: (areaFixes.length + 1) * 10000 - result.cost };
  }
}

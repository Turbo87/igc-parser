import {Fix} from '../../read-flight';
import Task from '../task';
import TaskPointTracker from '../task-point-tracker';

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

    let map = new Map<Fix, EdgeInfo>();

    for (let fix of areaFixes[0]) {
      let distance = this.task.measureDistance(this.task.start.shape.center, fix.coordinate);
      map.set(fix, { prevFix: this._tracker.starts[0], distance });
    }

    areaFixes.forEach((fixes, i) => {
      if (i === areaFixes.length - 1) {
        for (const fix of fixes) {
          let distance = map.get(fix)!.distance +
            this.task.measureDistance(fix.coordinate, this.task.finish.shape.center);

          let edgeInfo = map.get(this._tracker.finish!);
          if (!edgeInfo || edgeInfo.distance < distance) {
            map.set(this._tracker.finish!, { prevFix: fix, distance });
          }
        }
      } else {
        let nextAreaFixes = areaFixes[i + 1];
        for (const fix1 of fixes) {
          for (const fix2 of nextAreaFixes) {
            let distance = map.get(fix1)!.distance +
              this.task.measureDistance(fix1.coordinate, fix2.coordinate);

            let edgeInfo = map.get(fix2);
            if (!edgeInfo || edgeInfo.distance < distance) {
              map.set(fix2, { prevFix: fix1, distance });
            }
          }
        }
      }
    });

    let distance = map.get(this._tracker.finish!)!.distance;
    let path = [this._tracker.finish!];

    let next = this._tracker.finish!;
    let edgeInfo;
    while (edgeInfo = map.get(next)) {
      next = edgeInfo.prevFix;
      path.push(edgeInfo.prevFix);
    }

    path.reverse();

    return { path, distance };
  }
}

interface EdgeInfo {
  prevFix: Fix;
  distance: number;
}

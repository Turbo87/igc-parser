import * as turf from "@turf/turf";

import {Fix} from "../../read-flight";
import Task from "../task";
import AreaShape from "../shapes/area";
import {interpolateFix} from "../../utils/interpolate-fix";

const convexHull = require('convex-hull');

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
      if (tp.shape instanceof AreaShape) {
        if (tp.shape.isInside(fix.coordinate)) {
          this._areas[i].push(fix);
        }

        let intersections = tp.shape.findIntersections(lastFix.coordinate, fix.coordinate);
        this._areas[i].push(...intersections.map(fraction => interpolateFix(lastFix, fix, fraction)));
      }
    }
  }

  get thinnedAreas(): Array<Fix[]> {
    return this._areas.map(fixes => {
      let coords = fixes.map(fix => fix.coordinate);
      let hull = convexHull(coords);
      return hull.map((indices: any) => fixes[indices[0]]);
    });
  }

  get result() {
    return this.thinnedAreas.map(it => it.length);
  }
}

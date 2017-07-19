import * as turf from "@turf/turf";
import * as cheapRuler from "cheap-ruler";

import Point from "../../geo/point";
import Shape from "./base";
import {Fix} from "../../read-flight";

export default class Line implements Shape {
  readonly center: Point;
  readonly length: number;
  readonly direction: number; // direction in which the line is triggering transitions
  readonly coordinates: cheapRuler.Line;

  private readonly _ruler: cheapRuler.CheapRuler;
  private readonly _lineString: GeoJSON.Feature<GeoJSON.LineString>;

  constructor(center: Point, length: number, direction: number) {
    this.center = center;
    this.length = length;
    this.direction = direction;

    this._ruler = cheapRuler(center[1]);

    let p1 = this._ruler.destination(this.center, this.length / 2000, this.direction + 90);
    let p2 = this._ruler.destination(this.center, this.length / 2000, this.direction - 90);

    this.coordinates = [p1, p2];
    this._lineString = turf.lineString(this.coordinates);
  }

  /**
   * Checks if the line was crossed between `c1` and `c2` and returns
   * the fraction of distance covered from `c1` to `c2` until the line was
   * crossed or `undefined` otherwise.
   */
  checkTransition(p1: Point, p2: Point): number | undefined {
    let split = turf.lineSplit(turf.lineString([p1, p2]), this._lineString);
    if (split.features.length === 0)
      return;

    let bearing = this._ruler.bearing(p1, p2);
    let bearingDiff = turf.bearingToAngle(this.direction - bearing);
    if (bearingDiff > 90 && bearingDiff < 270)
      return;

    let d1 = turf.lineDistance(split.features[0]);
    let d2 = turf.lineDistance(split.features[1]);
    return d1 / (d1 + d2);
  }
}

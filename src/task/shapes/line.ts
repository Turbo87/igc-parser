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

  constructor(center: Point, length: number, direction: number) {
    this.center = center;
    this.length = length;
    this.direction = direction;

    this._ruler = cheapRuler(center[1]);

    let p1 = this._ruler.destination(this.center, this.length / 2000, this.direction + 90);
    let p2 = this._ruler.destination(this.center, this.length / 2000, this.direction - 90);

    this.coordinates = [p1, p2];
  }

  /**
   * Checks if the line was passed between `c1` and `c2` and returns
   * the interpolated fix of the line crossing or `undefined` otherwise.
   */
  checkTransition(fix1: Fix, fix2: Fix): GeoJSON.Feature<GeoJSON.Point> | undefined {
    let intersection = turf.lineIntersect(turf.lineString(this.coordinates), turf.lineString([fix1.coordinate, fix2.coordinate]));
    if (intersection.features.length === 0)
      return;

    let bearing = this._ruler.bearing(fix1.coordinate, fix2.coordinate);
    let bearingDiff = turf.bearingToAngle(this.direction - bearing);
    if (bearingDiff > 90 && bearingDiff < 270)
      return;

    return intersection.features[0];
  }
}

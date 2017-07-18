import * as turf from "@turf/turf";
import * as cheapRuler from "cheap-ruler";

import Cylinder from "./cylinder";
import Point from "../../geo/point";
import AreaShape from "./area";

export default class Sector extends AreaShape {
  readonly direction: number; // direction in which the sector is pointing
  readonly angle: number; // "width" of the sector in degrees

  private readonly _cylinder: Cylinder;
  private readonly _ruler: cheapRuler.CheapRuler;

  constructor(center: Point, radius: number, angle: number, direction: number) {
    super();

    this.angle = angle;
    this.direction = direction;

    this._cylinder = new Cylinder(center, radius);
    this._ruler = cheapRuler(center[1]);
  }

  get center(): Point {
    return this._cylinder.center;
  }

  get radius(): number {
    return this._cylinder.radius;
  }

  isInside(coordinate: Point): boolean {
    if (!this._cylinder.isInside(coordinate))
      return false;

    let bearing = this._ruler.bearing(this.center, coordinate);
    let bearingDiff = Math.abs(turf.bearingToAngle(this.direction - bearing)) * 2;
    return bearingDiff <= this.angle;
  }
}

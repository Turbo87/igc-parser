import * as cheapRuler from "cheap-ruler";
import * as turf from "@turf/turf";

import Point from "../../geo/point";
import AreaShape from "./area";

export default class Cylinder extends AreaShape {
  center: Point;
  radius: number;

  protected _polygon: Point[];

  private readonly _ruler: cheapRuler.CheapRuler;

  constructor(center: Point, radius: number) {
    super();

    this.center = center;
    this.radius = radius;

    let circle = turf.circle(center, radius / 1000, 360);
    this._polygon = circle.geometry.coordinates[0] as Point[];

    this._ruler = cheapRuler(center[1]);
  }

  checkEnter(p1: Point, p2: Point): number | undefined {
    if (!this.isInside(p1) && this.isInside(p2)) {
      let d1 = this._ruler.distance(this.center, p1);
      let d2 = this._ruler.distance(this.center, p2);
      return (d1 - this.radius / 1000) / (d1 - d2);
    }
  }

  isInside(coordinate: Point): boolean {
    let distance = this._ruler.distance(coordinate, this.center);
    return distance <= this.radius / 1000;
  }
}

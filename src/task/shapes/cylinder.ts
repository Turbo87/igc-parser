import * as turf from "@turf/turf";
import * as cheapRuler from "cheap-ruler";

import Point from "../../geo/point";
import AreaShape from "./area";

export default class Cylinder extends AreaShape {
  center: Point;
  radius: number;

  private readonly _ruler: cheapRuler.CheapRuler;

  constructor(center: Point, radius: number) {
    super();

    this.center = center;
    this.radius = radius;
    this._ruler = cheapRuler(center[1]);
  }

  checkEnter(c1: Point, c2: Point): GeoJSON.Feature<GeoJSON.Point> | undefined {
    let intersection = turf.lineIntersect(turf.circle(this.center, this.radius / 1000), turf.lineString([c1, c2]));
    if (intersection.features.length === 0)
      return;

    if (this.isInside(c2))
      return intersection.features[0];
  }

  isInside(coordinate: Point): boolean {
    let distance = this._ruler.distance(coordinate, this.center);
    return distance <= this.radius / 1000;
  }
}

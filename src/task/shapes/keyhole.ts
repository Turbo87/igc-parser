import * as turf from "@turf/turf";

import Cylinder from "./cylinder";
import Sector from "./sector";
import Point from "../../geo/point";
import AreaShape from "./area";

export default class Keyhole extends AreaShape {
  protected _polygon: Point[];

  private readonly _cylinder: Cylinder;
  private readonly _sector: Sector;

  constructor(center: Point, direction: number) {
    super();

    let innerRadius = 500;
    let outerRadius = 10000;
    let outerAngle = 90;

    let circle = turf.circle(center, innerRadius / 1000, 360);
    let sector = turf.sector(
      turf.point(center),
      outerRadius / 1000,
      direction - outerAngle / 2,
      direction + outerAngle / 2,
      Math.max(Math.round(outerAngle), 64)
    );

    this._polygon = turf.union(circle, sector).geometry.coordinates[0] as Point[];

    this._cylinder = new Cylinder(center, innerRadius);
    this._sector = new Sector(center, outerRadius, outerAngle, direction);
  }

  get center(): Point {
    return this._cylinder.center;
  }

  get direction(): number {
    return this._sector.direction;
  }

  get innerRadius(): number {
    return this._cylinder.radius;
  }

  get outerRadius(): number {
    return this._sector.radius;
  }

  get outerAngle(): number {
    return this._sector.angle;
  }

  isInside(coordinate: Point): boolean {
    return this._cylinder.isInside(coordinate) || this._sector.isInside(coordinate);
  }
}

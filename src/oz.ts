import * as turf from "@turf/turf";
import * as cheapRuler from "cheap-ruler";

import Point from "./point";

export interface ObservationZone {
  center: Point;
}

export class Cylinder implements ObservationZone {
  center: Point;
  radius: number;

  private readonly _ruler: cheapRuler.CheapRuler;

  constructor(center: Point, radius: number) {
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

export class Sector implements ObservationZone {
  readonly direction: number; // direction in which the sector is pointing
  readonly angle: number; // "width" of the sector in degrees

  private readonly _cylinder: Cylinder;
  private readonly _ruler: cheapRuler.CheapRuler;

  constructor(center: Point, radius: number, angle: number, direction: number) {
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

export class Keyhole implements ObservationZone {
  private readonly _cylinder: Cylinder;
  private readonly _sector: Sector;

  constructor(center: Point, direction: number) {
    let innerRadius = 500;
    let outerRadius = 10000;
    let outerAngle = 90;

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

export class Line implements ObservationZone {
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

  checkEnter(c1: Point, c2: Point): GeoJSON.Feature<GeoJSON.Point> | undefined {
    let intersection = turf.lineIntersect(turf.lineString(this.coordinates), turf.lineString([c1, c2]));
    if (intersection.features.length === 0)
      return;

    let bearing = this._ruler.bearing(c1, c2);
    let bearingDiff = turf.bearingToAngle(this.direction - bearing);
    if (bearingDiff > 90 && bearingDiff < 270)
      return;

    return intersection.features[0];
  }
}

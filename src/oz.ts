import * as turf from "@turf/turf";

export interface ObservationZone {
  center: GeoJSON.Position;

  checkEnter(c1: GeoJSON.Position, c2: GeoJSON.Position): GeoJSON.Feature<GeoJSON.Point> | undefined;
}

export class Cylinder implements ObservationZone {
  center: GeoJSON.Position;
  radius: number;

  constructor(center: GeoJSON.Position, radius: number) {
    this.center = center;
    this.radius = radius;
  }

  checkEnter(c1: GeoJSON.Position, c2: GeoJSON.Position): GeoJSON.Feature<GeoJSON.Point> | undefined {
    let intersection = turf.lineIntersect(turf.circle(this.center, this.radius / 1000), turf.lineString([c1, c2]));
    if (intersection.features.length === 0)
      return;

    if (this.isInside(c2))
      return intersection.features[0];
  }

  isInside(coordinate: GeoJSON.Position) {
    let distance = turf.distance(coordinate, this.center);
    return distance <= this.radius / 1000;
  }
}

export class Line implements ObservationZone {
  readonly center: GeoJSON.Position;
  readonly length: number;
  readonly direction: number; // direction in which the line is triggering transitions
  readonly coordinates: GeoJSON.Position[];

  constructor(center: GeoJSON.Position, length: number, direction: number) {
    this.center = center;
    this.length = length;
    this.direction = direction;

    let p1 = turf.destination(this.center, this.length / 2000, this.direction + 90);
    let p2 = turf.destination(this.center, this.length / 2000, this.direction - 90);

    this.coordinates = [p1.geometry.coordinates, p2.geometry.coordinates];
  }

  checkEnter(c1: GeoJSON.Position, c2: GeoJSON.Position): GeoJSON.Feature<GeoJSON.Point> | undefined {
    let intersection = turf.lineIntersect(turf.lineString(this.coordinates), turf.lineString([c1, c2]));
    if (intersection.features.length === 0)
      return;

    let bearing = turf.bearing(c1, c2);
    let bearingDiff = turf.bearingToAngle(this.direction - bearing);
    if (bearingDiff > 90 && bearingDiff < 270)
      return;

    return intersection.features[0];
  }
}

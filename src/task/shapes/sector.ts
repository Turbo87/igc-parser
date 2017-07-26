import * as turf from '@turf/turf';
import * as cheapRuler from 'cheap-ruler';
import {Feature, Polygon} from 'geojson';

import Point from '../../geo/point';
import AreaShape from './area';
import Cylinder from './cylinder';

export default class Sector extends AreaShape {
  readonly direction: number; // direction in which the sector is pointing
  readonly angle: number; // "width" of the sector in degrees

  protected _polygon: Feature<Polygon>;

  private readonly _cylinder: Cylinder;
  private readonly _ruler: cheapRuler.CheapRuler;

  constructor(center: Point, radius: number, angle: number, direction: number) {
    super();

    this.angle = angle;
    this.direction = direction;

    this._polygon = turf.sector(
      turf.point(center),
      radius / 1000,
      direction - angle / 2,
      direction + angle / 2,
      Math.max(Math.round(angle), 64),
    );

    this._cylinder = new Cylinder(center, radius);
    this._ruler = cheapRuler(center[1]);
  }

  get center(): Point {
    return this._cylinder.center;
  }

  get radius(): number {
    return this._cylinder.radius;
  }

  toGeoJSON(): Feature<Polygon> {
    return this._polygon;
  }
}

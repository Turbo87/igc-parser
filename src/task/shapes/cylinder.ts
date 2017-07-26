import {Feature, Polygon} from 'geojson';

import circle = require('@turf/circle');
import cheapRuler = require('cheap-ruler');

import Point from '../../geo/point';
import AreaShape from './area';

export default class Cylinder extends AreaShape {
  center: Point;
  radius: number;

  protected _polygon: Feature<Polygon>;

  private readonly _ruler: cheapRuler.CheapRuler;

  constructor(center: Point, radius: number) {
    super();

    this.center = center;
    this.radius = radius;

    this._polygon = circle(center, radius / 1000, 360);

    this._ruler = cheapRuler(center[1]);
  }

  checkEnter(p1: Point, p2: Point): number | undefined {
    if (!this.isInside(p1) && this.isInside(p2)) {
      let d1 = this._ruler.distance(this.center, p1);
      let d2 = this._ruler.distance(this.center, p2);
      return (d1 - this.radius / 1000) / (d1 - d2);
    }
  }

  toGeoJSON(): Feature<Polygon> {
    return this._polygon;
  }
}

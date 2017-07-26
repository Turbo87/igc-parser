import turf = require('@turf/turf');
import {Feature, Polygon} from 'geojson';

import {findIntersections} from '../../geo/find-intersections';
import Point from '../../geo/point';
import Shape from './base';

abstract class AreaShape implements Shape {
  abstract center: Point;

  isInside(coordinate: Point): boolean {
    return turf.inside(coordinate, this.toGeoJSON());
  }

  findIntersections(p1: Point, p2: Point): number[] {
    return findIntersections([p1, p2], this.toGeoJSON().geometry.coordinates[0] as Point[]);
  }

  abstract toGeoJSON(): Feature<Polygon>;
}

export default AreaShape;

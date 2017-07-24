import {Feature, Polygon} from "geojson";

import Point from "../../geo/point";
import Shape from "./base";
import {findIntersections} from "../../geo/find-intersections";

abstract class AreaShape implements Shape {
  abstract center: Point;

  abstract isInside(coordinate: Point): boolean;

  findIntersections(p1: Point, p2: Point): number[] {
    return findIntersections([p1, p2], this.toGeoJSON().geometry.coordinates[0] as Point[]);
  }

  abstract toGeoJSON(): Feature<Polygon>;
}

export default AreaShape;

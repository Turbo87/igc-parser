import Point from '../../geo/point';

interface Shape {
  center: Point;

  toGeoJSON(): GeoJSON.Feature<any>;
}

export default Shape;

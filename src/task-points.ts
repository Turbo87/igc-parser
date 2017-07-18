import Point from "./geo/point";
import {Cylinder, Line, Shape} from "./task/shapes";

export class StartPoint {
  shape: Shape;

  constructor(shape: Shape) {
    this.shape = shape;
  }

  checkStart(c1: Point, c2: Point): GeoJSON.Feature<GeoJSON.Point> | undefined {
    if (this.shape instanceof Line) {
      return this.shape.checkEnter(c1, c2);
    }
    // TODO support start areas too
  }
}

export class FinishPoint {
  shape: Shape;

  constructor(shape: Shape) {
    this.shape = shape;
  }

  checkFinish(c1: Point, c2: Point): GeoJSON.Feature<GeoJSON.Point> | undefined {
    if (this.shape instanceof Line) {
      return this.shape.checkEnter(c1, c2);
    } else if (this.shape instanceof Cylinder) {
      return this.shape.checkEnter(c1, c2);
    }
    // TODO support finish areas too
  }
}

export class TaskPoint {
  shape: Shape;

  constructor(shape: Shape) {
    this.shape = shape;
  }

  checkTransition(c1: Point, c2: Point): GeoJSON.Feature<GeoJSON.Point> | undefined {
    if (this.shape instanceof Line) {
      return this.shape.checkEnter(c1, c2);
    } else if (this.shape instanceof Cylinder) {
      return this.shape.checkEnter(c1, c2);
    }
    // TODO support other turn areas
  }
}

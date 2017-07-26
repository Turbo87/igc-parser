import {Fix} from '../read-flight';
import {Cylinder, Line, Shape} from './shapes';

export class StartPoint {
  shape: Shape;

  constructor(shape: Shape) {
    this.shape = shape;
  }
}

export class FinishPoint {
  shape: Shape;

  constructor(shape: Shape) {
    this.shape = shape;
  }
}

export class TaskPoint {
  shape: Shape;

  constructor(shape: Shape) {
    this.shape = shape;
  }

  checkTransition(fix1: Fix, fix2: Fix): any | undefined {
    if (this.shape instanceof Line) {
      return this.shape.checkTransition(fix1.coordinate, fix2.coordinate);
    } else if (this.shape instanceof Cylinder) {
      return this.shape.checkEnter(fix1.coordinate, fix2.coordinate);
    }
    // TODO support other turn areas
  }
}

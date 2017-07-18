import Point from "./point";
import {Cylinder, Keyhole, Line, ObservationZone} from "./oz";

export class StartPoint {
  oz: ObservationZone;

  constructor(oz: ObservationZone) {
    this.oz = oz;
  }

  checkStart(c1: Point, c2: Point): GeoJSON.Feature<GeoJSON.Point> | undefined {
    if (this.oz instanceof Line) {
      return this.oz.checkEnter(c1, c2);
    }
    // TODO support start areas too
  }
}

export class FinishPoint {
  oz: ObservationZone;

  constructor(oz: ObservationZone) {
    this.oz = oz;
  }

  checkFinish(c1: Point, c2: Point): GeoJSON.Feature<GeoJSON.Point> | undefined {
    if (this.oz instanceof Line) {
      return this.oz.checkEnter(c1, c2);
    } else if (this.oz instanceof Cylinder) {
      return this.oz.checkEnter(c1, c2);
    }
    // TODO support finish areas too
  }
}

export class TaskPoint {
  oz: ObservationZone;

  constructor(oz: ObservationZone) {
    this.oz = oz;
  }

  checkTransition(c1: Point, c2: Point): GeoJSON.Feature<GeoJSON.Point> | undefined {
    if (this.oz instanceof Line) {
      return this.oz.checkEnter(c1, c2);
    } else if (this.oz instanceof Cylinder) {
      return this.oz.checkEnter(c1, c2);
    }
    // TODO support other turn areas
  }
}

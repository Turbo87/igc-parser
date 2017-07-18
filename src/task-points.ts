import Point from "./point";
import {Line, ObservationZone} from "./oz";

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
    return this.oz.checkEnter(c1, c2);
  }
}

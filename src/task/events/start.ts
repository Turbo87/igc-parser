import Event from "./event";
import Point from "../../geo/point";
import {Fix} from "../../read-flight";

export default class StartEvent implements Event {
  type = 'start';

  time: number;
  point: Point;

  constructor(fix: Fix) {
    this.time = fix.time;
    this.point = fix.coordinate;
  }
}
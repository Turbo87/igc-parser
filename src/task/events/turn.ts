import Event from "./event";
import Point from "../../geo/point";
import {Fix} from "../../read-flight";

export default class TurnEvent implements Event {
  type = 'turn';

  time: number;
  point: Point;
  num: number;

  constructor(fix: Fix, num: number) {
    this.time = fix.time;
    this.point = fix.coordinate;
    this.num = num;
  }
}

import Point from '../../geo/point';
import {Fix} from '../../read-flight';
import Event from './event';

export default class FinishEvent implements Event {
  type = 'finish';

  time: number;
  point: Point;

  constructor(fix: Fix) {
    this.time = fix.time;
    this.point = fix.coordinate;
  }
}

import Point from '../../geo/point';

interface Event {
  type: string;
  time: number;
  point: Point;
}

export default Event;

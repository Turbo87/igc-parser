import Point from "./point";

export function interpolatePoint(p1: Point, p2: Point, fraction: number): Point {
  let fraction2 = 1 - fraction;
  return [p1[0] * fraction + p2[0] * fraction2, p1[1] * fraction + p2[1] * fraction2];
}

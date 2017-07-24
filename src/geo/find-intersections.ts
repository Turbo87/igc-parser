import Point from "./point";

export function findIntersections(line1: [Point, Point], line2: Point[]): number[] {
  let intersections: number[] = [];
  for (let i = 1; i < line2.length; i++) {
    let lineSegment = [line2[i - 1], line2[i]] as [Point, Point];
    let intersection = findIntersection(line1, lineSegment);
    if (intersection !== null) {
      intersections.push(intersection);
    }
  }
  return intersections.sort();
}

export function findIntersection(line1: [Point, Point], line2: [Point, Point]): number | null {
  // imported and adapted from "@turf/line-intersect"

  let x1 = line1[0][0];
  let y1 = line1[0][1];
  let x2 = line1[1][0];
  let y2 = line1[1][1];
  let x3 = line2[0][0];
  let y3 = line2[0][1];
  let x4 = line2[1][0];
  let y4 = line2[1][1];

  let x21 = x2 - x1;
  let x43 = x4 - x3;
  let y21 = y2 - y1;
  let y43 = y4 - y3;

  let denom = (y43 * x21) - (x43 * y21);
  if (denom === 0)
    return null;

  let y13 = y1 - y3;
  let x13 = x1 - x3;

  let uA = ((x43 * y13) - (y43 * x13)) / denom;
  if (uA < 0 || uA > 1)
    return null;

  let uB = ((x21 * y13) - (y21 * x13)) / denom;
  if (uB < 0 || uB > 1)
    return null;

  return uA;
}

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
  return intersections;
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
  let denom = ((y4 - y3) * (x2 - x1)) - ((x4 - x3) * (y2 - y1));
  let numeA = ((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3));
  let numeB = ((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3));

  if (denom === 0) {
    if (numeA === 0 && numeB === 0) {
      return null;
    }
    return null;
  }

  let uA = numeA / denom;
  let uB = numeB / denom;

  if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
    return uA;
  }
  return null;
}

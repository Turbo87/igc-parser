import {Fix} from "../read-flight";
import Point from "../geo/point";

export function interpolateFix(fix1: Fix, fix2: Fix, fraction: number): Fix {
  let fraction2 = 1 - fraction;

  let time = fix1.time * fraction + fix2.time * fraction2;

  let altitude;
  if (fix1.altitude !== undefined && fix2.altitude !== undefined) {
    altitude = fix1.altitude * fraction + fix2.altitude * fraction2;
  }

  let valid = fix1.valid && fix2.valid;

  let coordinate = [
    fix1.coordinate[0] * fraction + fix2.coordinate[0] * fraction2,
    fix1.coordinate[1] * fraction + fix2.coordinate[1] * fraction2,
  ] as Point;

  return {time, coordinate, altitude, valid};
}

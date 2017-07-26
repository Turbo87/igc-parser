import {interpolatePoint} from '../geo/interpolate-point';
import {Fix} from '../read-flight';

export function interpolateFix(fix1: Fix, fix2: Fix, fraction: number): Fix {
  let fraction1 = 1 - fraction;
  let fraction2 = fraction;

  let time = fix1.time * fraction1 + fix2.time * fraction2;

  let altitude;
  if (fix1.altitude !== undefined && fix2.altitude !== undefined) {
    altitude = fix1.altitude * fraction1 + fix2.altitude * fraction2;
  }

  let valid = fix1.valid && fix2.valid;

  let coordinate = interpolatePoint(fix1.coordinate, fix2.coordinate, fraction);

  return {time, coordinate, altitude, valid};
}

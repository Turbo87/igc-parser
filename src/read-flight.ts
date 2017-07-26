import * as fs from 'fs';

import Point from './geo/point';

const RE_HFDTE = /^HFDTE(\d{2})(\d{2})(\d{2})/;
const RE_B = /^B(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{3})([NS])(\d{3})(\d{2})(\d{3})([EW])([AV])(-\d{4}|\d{5})(-\d{4}|\d{5})/;

export interface Fix {
  time: number;
  coordinate: Point;
  valid: boolean;
  altitude: number | undefined;
}

export class BRecord implements Fix {
  readonly time: number;
  readonly coordinate: Point;
  readonly valid: boolean;
  readonly pressureAltitude: number | undefined;
  readonly gpsAltitude: number | undefined;

  constructor(line: string, date: number) {
    let match = line.match(RE_B);
    if (!match)
      throw new Error(`Invalid B record: ${line}`);

    let secOfDay = parseInt(match[1], 10) * 3600 + parseInt(match[2], 10) * 60 + parseInt(match[3], 10);
    this.time = date + secOfDay * 1000;

    let lat = parseInt(match[4], 10) + parseInt(match[5], 10) / 60 + parseInt(match[6], 10) / 60000;
    let lon = parseInt(match[8], 10) + parseInt(match[9], 10) / 60 + parseInt(match[10], 10) / 60000;
    this.coordinate = [lon, lat] as Point;

    this.valid = match[12] === 'A';

    this.pressureAltitude = match[13] === '00000' ? undefined : parseInt(match[13], 10);
    this.gpsAltitude = match[14] === '00000' ? undefined : parseInt(match[14], 10);
  }

  get altitude() {
    return this.gpsAltitude;
  }
}

export function readFlight(path: string): Fix[] {
  let lines = fs.readFileSync(path, 'utf8').split('\n');

  let date: number | undefined;
  let fixes: Fix[] = [];

  lines.forEach(line => {
    if (date === undefined) {
      date = findDate(line);
    }

    // TODO handle UTC-midnight wraparound
    if (date && line[0] === 'B') {
      let fix = new BRecord(line, date);
      if (fix) {
        fixes.push(fix);
      }
    }
  });

  return fixes;
}

function findDate(line: string): number | undefined {
  let match = line.match(RE_HFDTE);
  if (match) {
    let year = parseInt(match[3], 10) + 2000;
    let month = parseInt(match[2], 10) - 1;
    let day = parseInt(match[1], 10);
    return Date.UTC(year, month, day);
  }
}

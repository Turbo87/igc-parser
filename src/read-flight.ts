import * as fs from "fs";

const RE_HFDTE = /^HFDTE(\d{2})(\d{2})(\d{2})/;
const RE_B = /^B(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{3})([NS])(\d{3})(\d{2})(\d{3})([EW])/;

export interface Fix {
  secOfDay: number,
  time: number,
  coordinate: GeoJSON.Position,
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
    if (date) {
      let fix = convertLine(line, date);
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
    let year = parseInt(match[3]) + 2000;
    let month = parseInt(match[2]) - 1;
    let day = parseInt(match[1]);
    return Date.UTC(year, month, day);
  }
}

function convertLine(line: string, date: number): Fix | undefined {
  let match = line.match(RE_B);
  if (!match) return;

  let secOfDay = parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseInt(match[3]);
  let time = date + secOfDay * 1000;

  let lat = parseInt(match[4]) + parseInt(match[5]) / 60 + parseInt(match[6]) / 60000;
  let lon = parseInt(match[8]) + parseInt(match[9]) / 60 + parseInt(match[10]) / 60000;
  let coordinate = [lon, lat];

  return { secOfDay, time, coordinate };
}

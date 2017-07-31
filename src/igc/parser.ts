const ONE_HOUR = 60 * 60 * 1000;
const ONE_DAY = 24 * 60 * 60 * 1000;

/* tslint:disable:max-line-length */
const RE_HFDTE = /^HFDTE(\d{2})(\d{2})(\d{2})/;
const RE_B = /^B(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{3})([NS])(\d{3})(\d{2})(\d{3})([EW])([AV])(-\d{4}|\d{5})(-\d{4}|\d{5})/;
/* tslint:enable:max-line-length */

export interface IGCFile {
  /** UTC date of the flight in ISO 8601 format */
  date: string;

  fixes: BRecord[];
}

export interface HFDTEHeader {
  date: string;
}

export interface BRecord {
  /** Unix timestamp of the GPF fix in milliseconds */
  timestamp: number;

  /** UTC time of the GPF fix in ISO 8601 format */
  time: string;

  latitude: number;
  longitude: number;
  valid: boolean;
  pressureAltitude: number | null;
  gpsAltitude: number | null;
}

export default class IGCParser {
  private dateHeader: HFDTEHeader | null;
  private fixes: BRecord[] = [];

  private prevTimestamp: number | null;

  static parse(str: string): IGCFile {
    let parser = new IGCParser();

    for (let line of str.split('\n')) {
      parser.parseLine(line.trim());
    }

    return parser.result;
  }

  get result(): IGCFile {
    if (!this.dateHeader) {
      throw new Error(`Missing HFDTE record`);
    }

    return {
      date: this.dateHeader.date,
      fixes: this.fixes,
    };
  }

  private parseLine(line: string) {
    if (line.startsWith('B')) {
      let fix = this.parseBRecord(line);

      this.prevTimestamp = fix.timestamp;

      this.fixes.push(fix);

    } else if (line.startsWith('HFDTE')) {
      this.dateHeader = this.parseDateHeader(line);
    }
  }

  private parseDateHeader(line: string): HFDTEHeader {
    let match = line.match(RE_HFDTE);
    if (!match) {
      throw new Error(`Invalid HFDTE record: ${line}`);
    }

    let lastCentury = match[3][0] === '8' || match[3][0] === '9';
    let date = `${lastCentury ? '19' : '20'}${match[3]}-${match[2]}-${match[1]}`;

    return { date };
  }

  private parseBRecord(line: string): BRecord {
    if (!this.dateHeader) {
      throw new Error(`Missing HFDTE record before first B record`);
    }

    let match = line.match(RE_B);
    if (!match) {
      throw new Error(`Invalid B record: ${line}`);
    }

    let time = `${match[1]}:${match[2]}:${match[3]}`;

    let timestamp = Date.parse(`${this.dateHeader.date}T${time}Z`);

    // allow timestamps one hour before the previous timestamp,
    // otherwise we assume the next day is meant
    while (this.prevTimestamp && timestamp < this.prevTimestamp - ONE_HOUR) {
      timestamp += ONE_DAY;
    }

    let latitude = IGCParser.parseLatitude(match[4], match[5], match[6], match[7]);
    let longitude = IGCParser.parseLongitude(match[8], match[9], match[10], match[11]);

    let valid = match[12] === 'A';

    let pressureAltitude = match[13] === '00000' ? null : parseInt(match[13], 10);
    let gpsAltitude = match[14] === '00000' ? null : parseInt(match[14], 10);

    return { timestamp, time, latitude, longitude, valid, pressureAltitude, gpsAltitude };
  }

  private static parseLatitude(dd: string, mm: string, mmm: string, ns: string): number {
    let degrees = parseInt(dd, 10) + parseFloat(`${mm}.${mmm}`) / 60;
    return (ns === 'S') ? -degrees : degrees;
  }

  private static parseLongitude(ddd: string, mm: string, mmm: string, ew: string): number {
    let degrees = parseInt(ddd, 10) + parseFloat(`${mm}.${mmm}`) / 60;
    return (ew === 'W') ? -degrees : degrees;
  }
}

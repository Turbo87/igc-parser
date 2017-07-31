import {lookup as lookupManufacturer} from './manufacturers';

const ONE_HOUR = 60 * 60 * 1000;
const ONE_DAY = 24 * 60 * 60 * 1000;

/* tslint:disable:max-line-length */
const RE_A = /^A(\w{3})(\w{3,}?)(?:FLIGHT:(\d+)|\:(.+))?/;
const RE_HFDTE = /^HFDTE(\d{2})(\d{2})(\d{2})/;
const RE_PLT_HEADER = /^H[FO]PLT(?:.{0,}?:(.*)|(.*))$/;
const RE_CM2_HEADER = /^H[FO]CM2(?:.{0,}?:(.*)|(.*))$/;
const RE_GTY_HEADER = /^H[FO]GTY(?:.{0,}?:(.*)|(.*))$/;
const RE_GID_HEADER = /^H[FO]GID(?:.{0,}?:(.*)|(.*))$/;
const RE_CID_HEADER = /^H[FO]CID(?:.{0,}?:(.*)|(.*))$/;
const RE_CCL_HEADER = /^H[FO]CCL(?:.{0,}?:(.*)|(.*))$/;
const RE_B = /^B(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{3})([NS])(\d{3})(\d{2})(\d{3})([EW])([AV])(-\d{4}|\d{5})(-\d{4}|\d{5})/;
const RE_I = /^I(\d{2})(?:\d{2}\d{2}[A-Z]{3})+/;
/* tslint:enable:max-line-length */

export interface IGCFile {
  aRecord: ARecord;

  /** UTC date of the flight in ISO 8601 format */
  date: string;

  pilot: string | null;
  copilot: string | null;

  gliderType: string | null;
  registration: string | null;
  callsign: string | null;
  competitionClass: string | null;

  fixes: BRecord[];
}

export interface ARecord {
  manufacturer: string;
  loggerId: string;
  numFlight: number | null;
  additionalData: string | null;
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

  extensions: BRecordExtensions;

  fixAccuracy: number | null;

  /** Engine Noise Level from 0.0 to 1.0 */
  enl: number | null;
}

export interface BRecordExtensions {
  [code: string]: string;
}

export interface BRecordExtension {
  code: string;
  start: number;
  length: number;
}

export default class IGCParser {
  private aRecord: ARecord | null;
  private dateHeader: HFDTEHeader | null;
  private fixExtensions: BRecordExtension[];
  private fixes: BRecord[] = [];

  private pilot: string | null;
  private copilot: string | null;

  private gliderType: string | null;
  private registration: string | null;
  private callsign: string | null;
  private competitionClass: string | null;

  private lineNumber = 0;
  private prevTimestamp: number | null;

  static parse(str: string): IGCFile {
    let parser = new IGCParser();

    for (let line of str.split('\n')) {
      parser.parseLine(line.trim());
    }

    return parser.result;
  }

  get result(): IGCFile {
    if (!this.aRecord) {
      throw new Error(`Missing A record`);
    }

    if (!this.dateHeader) {
      throw new Error(`Missing HFDTE record`);
    }

    return {
      aRecord: this.aRecord,
      date: this.dateHeader.date,
      pilot: this.pilot,
      copilot: this.copilot,
      gliderType: this.gliderType,
      registration: this.registration,
      callsign: this.callsign,
      competitionClass: this.competitionClass,
      fixes: this.fixes,
    };
  }

  private parseLine(line: string) {
    this.lineNumber += 1;

    if (line.startsWith('B')) {
      let fix = this.parseBRecord(line);

      this.prevTimestamp = fix.timestamp;

      this.fixes.push(fix);

    } else if (line.startsWith('H')) {
      this.parseHeader(line);

    } else if (line.startsWith('A')) {
      this.aRecord = this.parseARecord(line);

    } else if (line.startsWith('I')) {
      this.fixExtensions = this.parseIRecord(line);
    }
  }

  private parseHeader(line: string) {
    let headerType = line.slice(2, 5);
    if (headerType === 'DTE') {
      this.dateHeader = this.parseDateHeader(line);
    } else if (headerType === 'PLT') {
      this.pilot = this.parsePilot(line);
    } else if (headerType === 'CM2') {
      this.copilot = this.parseCopilot(line);
    } else if (headerType === 'GTY') {
      this.gliderType = this.parseGliderType(line);
    } else if (headerType === 'GID') {
      this.registration = this.parseRegistration(line);
    } else if (headerType === 'CID') {
      this.callsign = this.parseCallsign(line);
    } else if (headerType === 'CCL') {
      this.competitionClass = this.parseCompetitionClass(line);
    }
  }

  private parseARecord(line: string): ARecord {
    let match = line.match(RE_A);
    if (!match) {
      throw new Error(`Invalid A record at line ${this.lineNumber}: ${line}`);
    }

    let manufacturer = lookupManufacturer(match[1]);
    let loggerId = match[2];
    let numFlight = match[3] ? parseInt(match[3], 10) : null;
    let additionalData = match[4] || null;

    return { manufacturer, loggerId, numFlight, additionalData };
  }

  private parseDateHeader(line: string): HFDTEHeader {
    let match = line.match(RE_HFDTE);
    if (!match) {
      throw new Error(`Invalid DTE header at line ${this.lineNumber}: ${line}`);
    }

    let lastCentury = match[3][0] === '8' || match[3][0] === '9';
    let date = `${lastCentury ? '19' : '20'}${match[3]}-${match[2]}-${match[1]}`;

    return { date };
  }

  private parseTextHeader(headerType: string, regex: RegExp, line: string, underscoreReplacement = ' '): string {
    let match = line.match(regex);
    if (!match) {
      throw new Error(`Invalid ${headerType} header at line ${this.lineNumber}: ${line}`);
    }

    return (match[1] || match[2] || '').replace(/_/g, underscoreReplacement).trim();
  }

  private parsePilot(line: string): string {
    return this.parseTextHeader('PLT', RE_PLT_HEADER, line);
  }

  private parseCopilot(line: string): string {
    return this.parseTextHeader('CM2', RE_CM2_HEADER, line);
  }

  private parseGliderType(line: string): string {
    return this.parseTextHeader('GTY', RE_GTY_HEADER, line);
  }

  private parseRegistration(line: string): string {
    return this.parseTextHeader('GID', RE_GID_HEADER, line, '-');
  }

  private parseCallsign(line: string): string {
    return this.parseTextHeader('GTY', RE_CID_HEADER, line);
  }

  private parseCompetitionClass(line: string): string {
    return this.parseTextHeader('GID', RE_CCL_HEADER, line);
  }

  private parseBRecord(line: string): BRecord {
    if (!this.dateHeader) {
      throw new Error(`Missing HFDTE record before first B record`);
    }

    let match = line.match(RE_B);
    if (!match) {
      throw new Error(`Invalid B record at line ${this.lineNumber}: ${line}`);
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

    let extensions: BRecordExtensions = {};
    if (this.fixExtensions) {
      for (let { code, start, length } of this.fixExtensions) {
        extensions[code] = line.slice(start, start + length);
      }
    }

    let enl = null;
    if (extensions['ENL']) {
      let enlLength = this.fixExtensions.filter(it => it.code === 'ENL')[0].length;
      let enlMax = Math.pow(10, enlLength);

      enl = parseInt(extensions['ENL'], 10) / enlMax;
    }

    let fixAccuracy = extensions['FXA'] ? parseInt(extensions['FXA'], 10) : null;

    return {
      timestamp,
      time,
      latitude,
      longitude,
      valid,
      pressureAltitude,
      gpsAltitude,
      extensions,
      enl,
      fixAccuracy,
    };
  }

  private parseIRecord(line: string): BRecordExtension[] {
    let match = line.match(RE_I);
    if (!match) {
      throw new Error(`Invalid I record at line ${this.lineNumber}: ${line}`);
    }

    let num = parseInt(match[1], 10);
    if (line.length < 3 + num * 7) {
      throw new Error(`Invalid I record at line ${this.lineNumber}: ${line}`);
    }

    let extensions = new Array<BRecordExtension>(num);

    for (let i = 0; i < num; i++) {
      let offset = 3 + i * 7;
      let start = parseInt(line.slice(offset, offset + 2), 10);
      let end = parseInt(line.slice(offset + 2, offset + 4), 10);
      let length = end - start + 1;
      let code = line.slice(offset + 4, offset + 7);

      extensions[i] = { start, length, code };
    }

    return extensions;
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

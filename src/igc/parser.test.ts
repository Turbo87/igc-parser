import IGCParser from './parser';

import fs = require('fs');

describe('IGCParser', () => {
  let parser: IGCParser;

  beforeEach(() => {
    parser = new IGCParser();
  });

  describe('parse()', () => {
    it('parses valid IGC files', () => {
      let filename = `${__dirname}/../../fixtures/2017-07-15-lev/1G_77fv6m71.igc`;
      let content = fs.readFileSync(filename, 'utf8');
      let result = IGCParser.parse(content);

      expect(result.aRecord).toEqual({
        manufacturer: 'LXNAV',
        loggerId: '6M7',
        numFlight: 1,
        additionalData: null,
      });

      expect(result.date).toEqual('2017-07-15');
      expect(result.pilot).toEqual('Florian Graf');
      expect(result.copilot).toBeUndefined();
      expect(result.gliderType).toEqual('ASW 19');
      expect(result.registration).toEqual('D-2019');
      expect(result.callsign).toEqual('1G');
      expect(result.competitionClass).toEqual('Club');

      expect(result.fixes.length).toEqual(4047);
      expect(result.fixes[0]).toMatchSnapshot();
      expect(result.fixes[1234]).toMatchSnapshot();
      expect(result.fixes[2042]).toMatchSnapshot();
      expect(result.fixes[4046]).toMatchSnapshot();
    });

    it('throws if HFDTE is missing', () => {
      let lines = [
        'ALXV6M7FLIGHT:1',
        'HFGIDGLIDERID:D-2019',
      ];

      expect(() => IGCParser.parse(lines.join('\n'))).toThrowErrorMatchingSnapshot();
    });

    it('handles UTC midnight correctly', () => {
      let result = IGCParser.parse([
        'ALXV6M7',
        'HFDTE150717',
        'B1926130000000N00000000EA0000000000',
        'B2300210000000N00000000EA0000000000',
        'B0001550000000N00000000EA0000000000',
        'B2359590000000N00000000EA0000000000',
        'B0242420000000N00000000EA0000000000',
        'B0659000000000N00000000EA0000000000',
        'B2200000000000N00000000EA0000000000',
        'B0100000000000N00000000EA0000000000',
      ].join('\n'));

      let fixTimestamps = result.fixes.map(fix => (new Date(fix.timestamp)).toISOString());
      expect(fixTimestamps).toEqual([
        '2017-07-15T19:26:13.000Z',
        '2017-07-15T23:00:21.000Z',
        '2017-07-16T00:01:55.000Z',
        '2017-07-15T23:59:59.000Z',
        '2017-07-16T02:42:42.000Z',
        '2017-07-16T06:59:00.000Z',
        '2017-07-16T22:00:00.000Z',
        '2017-07-17T01:00:00.000Z',
      ]);
    });
  });

  describe('parseARecord()', () => {
    it('parses valid HFDTE headers', () => {
      expect(parser['parseARecord']('AFLA1BG')).toEqual({
        manufacturer: 'Flarm',
        loggerId: '1BG',
        numFlight: null,
        additionalData: null,
      });

      expect(parser['parseARecord']('AMMMNNN:TEXT STRING')).toEqual({
        manufacturer: 'MMM',
        loggerId: 'NNN',
        numFlight: null,
        additionalData: 'TEXT STRING',
      });

      expect(parser['parseARecord']('ALXV6M7FLIGHT:1')).toEqual({
        manufacturer: 'LXNAV',
        loggerId: '6M7',
        numFlight: 1,
        additionalData: null,
      });

      expect(parser['parseARecord']('ALXNNE2FLIGHT:42')).toEqual({
        manufacturer: 'LX Navigation',
        loggerId: 'NE2',
        numFlight: 42,
        additionalData: null,
      });
    });

    it('throws for invalid records', () => {
      expect(() => parser['parseARecord']('')).toThrowErrorMatchingSnapshot();
      expect(() => parser['parseARecord']('HFDTE')).toThrowErrorMatchingSnapshot();
      expect(() => parser['parseARecord']('HFDTEXXXXXX')).toThrowErrorMatchingSnapshot();
      expect(() => parser['parseARecord']('HFDTE1234?6')).toThrowErrorMatchingSnapshot();
    });
  });

  describe('parseDateHeader()', () => {
    it('parses valid HFDTE headers', () => {
      expect(parser['parseDateHeader']('HFDTE010180')).toEqual({ date: '1980-01-01' });
      expect(parser['parseDateHeader']('HFDTE150717')).toEqual({ date: '2017-07-15' });
      expect(parser['parseDateHeader']('HFDTE311279')).toEqual({ date: '2079-12-31' });
    });

    it('throws for invalid records', () => {
      expect(() => parser['parseDateHeader']('')).toThrowErrorMatchingSnapshot();
      expect(() => parser['parseDateHeader']('HFDTE')).toThrowErrorMatchingSnapshot();
      expect(() => parser['parseDateHeader']('HFDTEXXXXXX')).toThrowErrorMatchingSnapshot();
      expect(() => parser['parseDateHeader']('HFDTE1234?6')).toThrowErrorMatchingSnapshot();
    });
  });

  describe('parsePilot()', () => {
    it('parses valid PLT headers', () => {
      expect(parser['parsePilot']('HFPLTPILOT:')).toEqual('');
      expect(parser['parsePilot']('HFPLTPilotincharge:Mike Havener')).toEqual('Mike Havener');
      expect(parser['parsePilot']('HFPLTPILOT:BEN BRAND')).toEqual('BEN BRAND');
      expect(parser['parsePilot']('HFPLTPILOT:foo:bar')).toEqual('foo:bar');
      expect(parser['parsePilot']('HFPLTPILOTINCHARGE:YUTA_ISHIGURO')).toEqual('YUTA ISHIGURO');
      expect(parser['parsePilot']('HFPLT Pilot             :Gisela Weinreich  ')).toEqual('Gisela Weinreich');
      expect(parser['parsePilot']('HFPLT:John Doe')).toEqual('John Doe');
      expect(parser['parsePilot']('HOPLTJohn Doe')).toEqual('John Doe');
    });

    it('throws for invalid records', () => {
      expect(() => parser['parsePilot']('')).toThrowErrorMatchingSnapshot();
      expect(() => parser['parsePilot']('HXPLT:John Doe')).toThrowErrorMatchingSnapshot();
      expect(() => parser['parsePilot']('HFPLX:John Doe')).toThrowErrorMatchingSnapshot();
    });
  });

  describe('parseCopilot()', () => {
    it('parses valid CM2 headers', () => {
      expect(parser['parseCopilot']('HFCM2CREW2:')).toEqual('');
      expect(parser['parseCopilot']('HFCM2Crew 2:Mike Havener')).toEqual('Mike Havener');
      expect(parser['parseCopilot']('HFCM2CREW2:BEN BRAND')).toEqual('BEN BRAND');
      expect(parser['parseCopilot']('HFCM2CREW2:foo:bar')).toEqual('foo:bar');
      expect(parser['parseCopilot']('HFCM2CREW2:YUTA_ISHIGURO')).toEqual('YUTA ISHIGURO');
      expect(parser['parseCopilot']('HFCM2 Copilot           :Gisela Weinreich  ')).toEqual('Gisela Weinreich');
      expect(parser['parseCopilot']('HFCM2:John Doe')).toEqual('John Doe');
      expect(parser['parseCopilot']('HOCM2John Doe')).toEqual('John Doe');
    });

    it('throws for invalid records', () => {
      expect(() => parser['parseCopilot']('')).toThrowErrorMatchingSnapshot();
      expect(() => parser['parseCopilot']('HXCM2:John Doe')).toThrowErrorMatchingSnapshot();
      expect(() => parser['parseCopilot']('HFCM1:John Doe')).toThrowErrorMatchingSnapshot();
    });
  });

  describe('parseBRecord()', () => {
    it('parses valid B records', () => {
      parser['dateHeader'] = { date: '2017-02-03' };

      expect(parser['parseBRecord']('B1026555103888N00703115EA0065700751')).toEqual({
        timestamp: 1486117615000,
        time: '10:26:55',
        latitude: 51.0648,
        longitude: 7.051916666666667,
        valid: true,
        pressureAltitude: 657,
        gpsAltitude: 751,
        extensions: {},
        fixAccuracy: null,
        enl: null,
      });

      expect(parser['parseBRecord']('B0000005103888N00703115EV0000000000')).toEqual({
        timestamp: 1486080000000,
        time: '00:00:00',
        latitude: 51.0648,
        longitude: 7.051916666666667,
        valid: false,
        pressureAltitude: null,
        gpsAltitude: null,
        extensions: {},
        fixAccuracy: null,
        enl: null,
      });
    });

    it('throws for missing "dateHeader"', () => {
      expect(() => parser['parseBRecord']('B1026555103888N00703115EA0065700751')).toThrowErrorMatchingSnapshot();
    });

    it('throws for invalid records', () => {
      parser['dateHeader'] = { date: '2017-02-03' };

      expect(() => parser['parseBRecord']('')).toThrowErrorMatchingSnapshot();
      expect(() => parser['parseBRecord']('B10a6555103888N00703115EA0065700751')).toThrowErrorMatchingSnapshot();
      expect(() => parser['parseBRecord']('B1026555103888X00703115EA0065700751')).toThrowErrorMatchingSnapshot();
      expect(() => parser['parseBRecord']('B102655510Z888N00703115EA0065700751')).toThrowErrorMatchingSnapshot();
      expect(() => parser['parseBRecord']('B1026555103888N00703115NA0065700751')).toThrowErrorMatchingSnapshot();
    });
  });

  describe('parseIRecord()', () => {
    it('parses valid I records', () => {
      expect(parser['parseIRecord']('I013638FXA')).toEqual([
        { code: 'FXA', start: 36, length: 3 },
      ]);

      expect(parser['parseIRecord']('I043638FXA3940SIU4143ENL4446MOP')).toEqual([
        { code: 'FXA', start: 36, length: 3 },
        { code: 'SIU', start: 39, length: 2 },
        { code: 'ENL', start: 41, length: 3 },
        { code: 'MOP', start: 44, length: 3 },
      ]);

      expect(parser['parseIRecord']('I083638FXA3941ENL4246TAS4751GSP5254TRT5559VAT6063OAT6467ACZ')).toEqual([
        { code: 'FXA', start: 36, length: 3 },
        { code: 'ENL', start: 39, length: 3 },
        { code: 'TAS', start: 42, length: 5 },
        { code: 'GSP', start: 47, length: 5 },
        { code: 'TRT', start: 52, length: 3 },
        { code: 'VAT', start: 55, length: 5 },
        { code: 'OAT', start: 60, length: 4 },
        { code: 'ACZ', start: 64, length: 4 },
      ]);
    });

    it('throws for invalid records', () => {
      expect(() => parser['parseIRecord']('')).toThrowErrorMatchingSnapshot();
      expect(() => parser['parseIRecord']('I023638FXA')).toThrowErrorMatchingSnapshot();
      expect(() => parser['parseIRecord']('I0136FXA38')).toThrowErrorMatchingSnapshot();
    });
  });
});

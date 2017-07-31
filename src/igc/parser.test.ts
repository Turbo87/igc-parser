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

      expect(result.date).toEqual('2017-07-15');
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
      });

      expect(parser['parseBRecord']('B0000005103888N00703115EV0000000000')).toEqual({
        timestamp: 1486080000000,
        time: '00:00:00',
        latitude: 51.0648,
        longitude: 7.051916666666667,
        valid: false,
        pressureAltitude: null,
        gpsAltitude: null,
      });
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
});

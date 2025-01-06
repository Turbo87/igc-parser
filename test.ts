import fs = require('fs');
import IGCParser = require('.');

describe('IGCParser', () => {
  let parser: IGCParser;
  let lenientParser: IGCParser;

  beforeEach(() => {
    parser = new IGCParser();
    lenientParser = new IGCParser({ lenient: true });
  });

  describe('parse()', () => {
    test('1G_77fv6m71.igc', () => {
      let content = fs.readFileSync(`${__dirname}/fixtures/1G_77fv6m71.igc`, 'utf8');
      let result = IGCParser.parse(content);

      expect(result.fixes.length).toEqual(4047);
      expect(result.dataRecords.length).toEqual(80);

      // reduce number of fixes to assert
      result.fixes = [
        result.fixes[0],
        result.fixes[1234],
        result.fixes[2042],
        result.fixes[4046],
      ];

      // reduce number of data records to assert
      result.dataRecords = [
        result.dataRecords[0],
        result.dataRecords[42],
        result.dataRecords[result.dataRecords.length - 1],
      ];

      expect(result).toMatchSnapshot();
    });

    test('654G6NG1.IGC', () => {
      let content = fs.readFileSync(`${__dirname}/fixtures/654G6NG1.IGC`, 'utf8');
      let result = IGCParser.parse(content);

      // reduce number of fixes to assert
      result.fixes = [
        result.fixes[0],
        result.fixes[123],
        result.fixes[420],
        result.fixes[3000],
        result.fixes[result.fixes.length - 1],
      ];

      expect(result).toMatchSnapshot();
    });

    test('2016-11-08-xcs-aaa-02.igc', () => {
      let content = fs.readFileSync(`${__dirname}/fixtures/2016-11-08-xcs-aaa-02.igc`, 'utf8');
      let result = IGCParser.parse(content);

      expect(result.fixes.length).toEqual(6752);

      // reduce number of fixes to assert
      result.fixes = [
        result.fixes[0],
        result.fixes[1234],
        result.fixes[2042],
        result.fixes[result.fixes.length - 1],
      ];

      expect(result).toMatchSnapshot();
    });

    test('20180427.igc', () => {
      let content = fs.readFileSync(`${__dirname}/fixtures/20180427.igc`, 'utf8');
      let result = IGCParser.parse(content);

      expect(result.fixes.length).toEqual(1831);

      // reduce number of fixes to assert
      result.fixes = [
        result.fixes[0],
        result.fixes[234],
        result.fixes[1777],
        result.fixes[result.fixes.length - 1],
      ];

      expect(result).toMatchSnapshot();
    });

    test('20211015.igc', () => {
      let content = fs.readFileSync(`${__dirname}/fixtures/20211015.igc`, 'utf8');
      let result = IGCParser.parse(content);

      expect(result.fixes.length).toEqual(4886);
      expect(result.site).toEqual("Riederalp");

      // reduce number of fixes to assert
      result.fixes = [
        result.fixes[0],
        result.fixes[234],
        result.fixes[1777],
        result.fixes[result.fixes.length - 1],
      ];

      expect(result).toMatchSnapshot();
    });

    /* Test timezone parsing */
    test('20241007TZN.igc', () => {
      let content = fs.readFileSync(`${__dirname}/fixtures/20241007TZN.igc`, 'utf8');
      let result = IGCParser.parse(content);

      expect(result.timezone).toEqual(5.5);
    });

    test('MD_85ugkjj1.IGC', () => {
      let content = fs.readFileSync(`${__dirname}/fixtures/MD_85ugkjj1.IGC`, 'utf8');
      let result = IGCParser.parse(content, { lenient: true });

      expect(result.fixes.length).toEqual(8924);
      expect(result.errors).toMatchSnapshot();
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

  describeMethod('parseARecord', (test) => {
    test.pass('AFLA1BG', {
      manufacturer: 'Flarm',
      loggerId: '1BG',
      numFlight: null,
      additionalData: null,
    });

    test.pass('AMMMNNN:TEXT STRING', {
      manufacturer: 'MMM',
      loggerId: 'NNN',
      numFlight: null,
      additionalData: 'TEXT STRING',
    });

    test.pass('ALXV6M7FLIGHT:1', {
      manufacturer: 'LXNAV',
      loggerId: '6M7',
      numFlight: 1,
      additionalData: null,
    });

    test.pass('ALXNNE2FLIGHT:42', {
      manufacturer: 'LX Navigation',
      loggerId: 'NE2',
      numFlight: 42,
      additionalData: null,
    });

    test.pass('AXYZ123456:foo', {
      manufacturer: 'XYZ',
      loggerId: '123456',
      numFlight: null,
      additionalData: 'foo',
    });

    test.pass('AXCT XCTrack 0.6.0 on samsung GT-S6500 2.3.6', {
      manufacturer: 'XCTrack',
      loggerId: null,
      numFlight: null,
      additionalData: 'XCTrack 0.6.0 on samsung GT-S6500 2.3.6',
    });

    test.pass('AXGD Flymaster F1, V1.21, S/N 3556', {
      manufacturer: 'GpsDump',
      loggerId: null,
      numFlight: null,
      additionalData: 'Flymaster F1, V1.21, S/N 3556',
    });

    test.pass('AXSR', {
      manufacturer: 'XSR',
      loggerId: null,
      numFlight: null,
      additionalData: null,
    });

    test.fail('');
    test.fail('HFDTE');
    test.fail('HFDTEXXXXXX');
    test.fail('HFDTE1234?6');
  });

  describeMethod('parseDateHeader', (test) => {
    test.pass('HFDTE010180', { date: '1980-01-01', numFlight: null });
    test.pass('HFDTE150717', { date: '2017-07-15', numFlight: null });
    test.pass('HFDTE15071799', { date: '2017-07-15', numFlight: 99 });
    test.pass('HFDTE311279', { date: '2079-12-31', numFlight: null });
    test.pass('HFDTEDATE:150717', { date: '2017-07-15', numFlight: null });
    test.pass('HFDTEDATE:15071702', { date: '2017-07-15', numFlight: 2 });
    test.pass('HFDTEDATE:150717,01', { date: '2017-07-15', numFlight: 1 });

    test.fail('');
    test.fail('HFDTE');
    test.fail('HFDTEXXXXXX');
    test.fail('HFDTE1234?6');
  });

  describeMethod('parsePilot', (test) => {
    test.pass('HFPLTPILOT:', '');
    test.pass('HFPLTPilotincharge:Mike Havener', 'Mike Havener');
    test.pass('HFPLTPILOT:BEN BRAND', 'BEN BRAND');
    test.pass('HFPLTPILOT:foo:bar', 'foo:bar');
    test.pass('HFPLTPILOTINCHARGE:YUTA_ISHIGURO', 'YUTA ISHIGURO');
    test.pass('HFPLT Pilot             :Gisela Weinreich  ', 'Gisela Weinreich');
    test.pass('HFPLT:John Doe', 'John Doe');
    test.pass('HOPLTJohn Doe', 'John Doe');

    test.fail('');
    test.fail('HXPLT:John Doe');
    test.fail('HFPLX:John Doe');
  });

  describeMethod('parseCopilot', (test) => {
    test.pass('HFCM2CREW2:', '');
    test.pass('HFCM2Crew 2:Mike Havener', 'Mike Havener');
    test.pass('HFCM2CREW2:BEN BRAND', 'BEN BRAND');
    test.pass('HFCM2CREW2:foo:bar', 'foo:bar');
    test.pass('HFCM2CREW2:YUTA_ISHIGURO', 'YUTA ISHIGURO');
    test.pass('HFCM2 Copilot           :Gisela Weinreich  ', 'Gisela Weinreich');
    test.pass('HFCM2:John Doe', 'John Doe');
    test.pass('HOCM2John Doe', 'John Doe');
    test.pass('HPCM2:John Doe', 'John Doe');

    test.fail('');
    test.fail('HXCM2:John Doe');
    test.fail('HFCM1:John Doe');

    test.pass('HXCM2:John Doe', 'John Doe', { lenient: true });
  });

  describeMethod('parseTask', (test) => {
    test.pass('C150717085720000000000204', {
      comment: null,
      declarationDate: '2017-07-15',
      declarationTime: '08:57:20',
      declarationTimestamp: 1500109040000,
      flightDate: null,
      numTurnpoints: 4,
      points: [],
      taskNumber: 2,
    });

    test.pass('C1707171703131707170001-2', {
      comment: null,
      declarationDate: '2017-07-17',
      declarationTime: '17:03:13',
      declarationTimestamp: 1500310993000,
      flightDate: '2017-07-17',
      numTurnpoints: -2,
      points: [],
      taskNumber: 1,
    });

    test.fail('');
    test.fail('C17071717031317');
  });

  describeMethod('parseBRecord', (test) => {
    beforeEach(() => {
      parser['_result'].date = '2017-02-03';
    });

    test.pass('B1026555103888N00703115EA0065700751', {
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

    test.pass('B0000005103888N00703115EV0000000000', {
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

    test.fail('');
    test.fail('B10a6555103888N00703115EA0065700751');
    test.fail('B1026555103888X00703115EA0065700751');
    test.fail('B102655510Z888N00703115EA0065700751');
    test.fail('B1026555103888N00703115NA0065700751');
  });

  describe('parseBRecord()', () => {
    it('throws for missing "dateHeader"', () => {
      expect(() => parser['parseBRecord']('B1026555103888N00703115EA0065700751')).toThrowErrorMatchingSnapshot();
    });
  });

  describeMethod('parseIJRecord', (test) => {
    test.pass('I013638FXA', [
      { code: 'FXA', start: 35, length: 3 },
    ]);

    test.pass('J043638FXA3940SIU4143ENL4446MOP', [
      { code: 'FXA', start: 35, length: 3 },
      { code: 'SIU', start: 38, length: 2 },
      { code: 'ENL', start: 40, length: 3 },
      { code: 'MOP', start: 43, length: 3 },
    ]);

    test.pass('I083638FXA3941ENL4246TAS4751GSP5254TRT5559VAT6063OAT6467ACZ', [
      { code: 'FXA', start: 35, length: 3 },
      { code: 'ENL', start: 38, length: 3 },
      { code: 'TAS', start: 41, length: 5 },
      { code: 'GSP', start: 46, length: 5 },
      { code: 'TRT', start: 51, length: 3 },
      { code: 'VAT', start: 54, length: 5 },
      { code: 'OAT', start: 59, length: 4 },
      { code: 'ACZ', start: 63, length: 4 },
    ]);

    test.fail('');
    test.fail('I023638FXA');
    test.fail('I0136FXA38');
  });

  // Test Suite Generator

  function describeMethod(methodName: string, cb: (test: any) => void) {
    describe(`${methodName}()`, () => {
      cb({
        pass(input: string, expected: any, options: { lenient?: boolean } = {}) {
          let testName = input ? input : '[empty]';
          if (typeof expected === 'string') {
            testName += ` -> ${expected ? `'${expected}'` : '[empty]'}`;
          }

          test(testName, () => {
            let _parser = options.lenient ? lenientParser : parser as any;
            expect(_parser[methodName](input)).toEqual(expected);
          });
        },

        fail(input: string, options: { lenient?: boolean } = {}) {
          test(`${input ? input : '[empty]'} -> 💥 `, () => {
            let _parser = options.lenient ? lenientParser : parser as any;
            expect(() => _parser[methodName](input)).toThrowErrorMatchingSnapshot();
          });
        },
      });
    });
  }
});

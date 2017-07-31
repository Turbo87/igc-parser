import {IGCFilenameData, parse} from './filename-parser';

const tests = [
  ['', null],
  ['xaaga071.igc', null],
  ['4aaga071.igc', data('2014-10-10', 'Flarm', 'A07', 1)],
  ['4aaga07x.igc', data('2014-10-10', 'Flarm', 'A07', 32)],
  ['811ga071.igc', data('2008-01-01', 'Flarm', 'A07', 1)],
  ['711ga071.igc', data('2017-01-01', 'Flarm', 'A07', 1)],
  ['649V6B31.igc', data('2016-04-09', 'LXNAV', '6B3', 1)],
  ['649v6ea2.igc', data('2016-04-09', 'LXNAV', '6EA', 2)],
  ['654G6NG1.IGC', data('2016-05-04', 'Flarm', '6NG', 1)],
  ['654VJJM1.igc', data('2016-05-04', 'LXNAV', 'JJM', 1)],
  ['67LG6NG1.IGC', data('2016-07-21', 'Flarm', '6NG', 1)],
  ['67og6ng1.igc', data('2016-07-24', 'Flarm', '6NG', 1)],
  ['76av3hp2.igc', data('2017-06-10', 'LXNAV', '3HP', 2)],
  ['77dv3hp1.igc', data('2017-07-13', 'LXNAV', '3HP', 1)],
  ['7cdv3hp1.igc', data('2017-12-13', 'LXNAV', '3HP', 1)],
  ['78_65dv1qz1.igc', data('2016-05-13', 'LXNAV', '1QZ', 1, '78')],
  ['78_65dv1qz1-bla.igc', data('2016-05-13', 'LXNAV', '1QZ', 1, '78')],
  ['TH_77U.igc', data('2017-07-30', null, null, null, 'TH')],
  ['2013-08-12-fla-6ng-01334499802.igc', data('2013-08-12', 'Flarm', '6NG', 1)],
  ['2013-10-19-xcs-aaa-05_1.igc', data('2013-10-19', 'XCS', 'AAA', 5)],
  ['2015-01-21-xxx-asc-47.igc', data('2015-01-21', 'XXX', 'ASC', 47)],
  ['TH_2015-01-21-xxx-asc-47.igc', data('2015-01-21', 'XXX', 'ASC', 47, 'TH')],
] as Array<[string, IGCFilenameData | null]>;

describe('IGC filename parser', () => {
  let currentYear = 2017;

  for (let [filename, expected] of tests) {
    test(filename, () => {
      expect(parse(filename, currentYear)).toEqual(expected);
    });
  }
});

function data(date: string, manufacturer: string | null, loggerId: string | null,
              numFlight: number | null = null, callsign: string | null = null): IGCFilenameData {

  return { date, manufacturer, loggerId, numFlight, callsign };
}

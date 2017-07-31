import {IGCFilenameData, parse} from './filename-parser';

import fs = require('fs');

const tests = [
  ['', null],
  ['xaaga071.igc', null],
  ['4aaga071.igc', data('2014-10-10', 'Flarm', 'A07', 1)],
  ['4aaga07x.igc', data('2014-10-10', 'Flarm', 'A07', 33)],
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
  ['77U_TH.igc', data('2017-07-30', null, null, null, 'TH')],
  ['2013-08-12-fla-6ng-01334499802.igc', data('2013-08-12', 'Flarm', '6NG', 1)],
  ['2013-10-19-xcs-aaa-05_1.igc', data('2013-10-19', 'XCS', 'AAA', 5)],
  ['2015-01-21-xxx-asc-47.igc', data('2015-01-21', 'XXX', 'ASC', 47)],
  ['TH_2015-01-21-xxx-asc-47.igc', data('2015-01-21', 'XXX', 'ASC', 47, 'TH')],
  ['05l_hs__1_.igc', null],
  ['110911sw-welle_seyne.igc', null],
  ['ykep_08dec12.igc', null],
  ['ybla_13nov12c.igc', null],
  ['ww_30102016.igc', null],
  ['2013-01-07.igc', data('2013-01-07')],
  ['20130107.igc', data('2013-01-07')],
  ['2013.01.07_1000km.igc', data('2013-01-07')],
  ['2009_05_27_lamotte_kfnw_95rf1091.igc', data('2009-05-27')],
  ['2012_10_10_12_10_17.igc', data('2012-10-10')],
  ['igcdroid_2016_jan_30_13-14.igc', data('2016-01-30')],
  ['2013-01-08_flight_1.igc', data('2013-01-08', null, null, 1)],
] as Array<[string, IGCFilenameData | null]>;

describe('IGC filename parser', () => {
  let currentYear = 2017;

  for (let [filename, expected] of tests) {
    test(filename, () => {
      expect(parse(filename, currentYear)).toEqual(expected);
    });
  }

  it('does not crash', () => {
    let filesname = fs.readFileSync(`${__dirname}/../../fixtures/igc-filenames.txt`, 'utf8').split('\n');
    for (let filename of filesname) {
      expect(() => parse(filename)).not.toThrow();
    }
  });
});

function data(date: string, manufacturer: string | null = null, loggerId: string | null = null,
              numFlight: number | null = null, callsign: string | null = null): IGCFilenameData {

  return { date, manufacturer, loggerId, numFlight, callsign };
}

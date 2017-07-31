import {lookup} from './manufacturers';

describe('flight recorder manufacturers', () => {
  test('lookup()', () => {
    expect(lookup('X', true)).toEqual('X');
    expect(lookup('V', true)).toEqual('LXNAV');
    expect(lookup('G', true)).toEqual('Flarm');
    expect(lookup('LXV')).toEqual('LXNAV');
    expect(lookup('LXN')).toEqual('LX Navigation');
    expect(lookup('FLA')).toEqual('Flarm');
    expect(lookup('XCS')).toEqual('XCSoar');
    expect(lookup('XXX')).toEqual('XXX');
  });
});

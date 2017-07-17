const fs = require('fs');
const readFlight = require('./read-flight');

describe('readFlight()', () => {
  it(`reads "SW_77flqgg1" flight log correctly`, () => {
    let flight = readFlight(`${__dirname}/../fixtures/2017-07-15-lev/SW_77flqgg1.IGC`);
    expect(flight).toMatchSnapshot();
  })
});

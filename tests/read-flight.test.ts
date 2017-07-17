import {readFlight} from "../src/read-flight";

describe('readFlight()', () => {
  it(`reads "SW_77flqgg1" flight log correctly`, () => {
    let flight = readFlight(`${__dirname}/../fixtures/2017-07-15-lev/SW_77flqgg1.IGC`);
    expect(flight[0]).toMatchSnapshot();
    expect(flight[1234]).toMatchSnapshot();
    expect(flight[3333]).toMatchSnapshot();
  })
});

import * as fs from "fs";

import {readFlight} from "../src/read-flight";
import {TakeoffDetector} from "../src/takeoff-detector";
import {formatTime} from "../src/format-result";

describe('TakeoffDetector', () => {
  fs.readdirSync(`${__dirname}/../fixtures/2017-07-15-lev`).filter(filename => (/\.igc$/i).test(filename)).forEach(filename => {
    let callsign = filename.match(/^(.{1,3})_/)![1];

    it(`detects takeoff and landing for "${callsign}"`, () => {
      let flight = readFlight(`${__dirname}/../fixtures/2017-07-15-lev/${filename}`);

      let detector = new TakeoffDetector();

      let takeoff, landing;
      detector.onTakeoff = fix => (takeoff = takeoff || fix);
      detector.onLanding = fix => (landing = fix);

      flight.forEach(fix => detector.update(fix));

      expect(`${takeoff && formatTime(takeoff.secOfDay)} - ${landing && formatTime(landing.secOfDay)}`).toMatchSnapshot();
    });
  });
});




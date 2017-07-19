import * as fs from "fs";

import {Fix, readFlight} from "./read-flight";
import {TakeoffDetector} from "./takeoff-detector";
import {formatTime} from "./format-result";

describe('TakeoffDetector', () => {
  fs.readdirSync(`${__dirname}/../fixtures/2017-07-15-lev`).filter(filename => (/\.igc$/i).test(filename)).forEach(filename => {
    let callsign = filename.match(/^(.{1,3})_/)![1];

    it(`detects takeoff and landing for "${callsign}"`, () => {
      let flight = readFlight(`${__dirname}/../fixtures/2017-07-15-lev/${filename}`);

      let detector = new TakeoffDetector();

      let takeoff: Fix | undefined, landing: Fix | undefined;
      detector.on('takeoff', (fix: Fix) => (takeoff = takeoff || fix));
      detector.on('landing', (fix: Fix) => (landing = fix));

      flight.forEach(fix => detector.update(fix));

      expect(`${takeoff && formatTime(takeoff.time)} - ${landing && formatTime(landing.time)}`).toMatchSnapshot();
    });
  });
});




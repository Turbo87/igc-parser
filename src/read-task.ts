import * as fs from "fs";
import * as turf from "@turf/turf";

import {Turnpoint} from "./turnpoint";
import {Cylinder, Line} from "./oz";
import {read, XCSoarLocation} from "./xcsoar/task-reader";

export interface Task {
  isAAT: boolean,
  aatMinTime: number,
  points: Turnpoint[],
}

export function readTask(path: string): Task {
  let file = fs.readFileSync(path, 'utf8');
  let task = read(file);

  return {
    isAAT: task.type === 'AAT',
    aatMinTime: task.aat_min_time,
    points: task.points.map((point, i) => {
      let location = convertLocation(point.waypoint.location);

      let observationZone;
      if (point.observation_zone.type === 'Line') {
        let direction;
        if (i === 0) {
          let locNext = convertLocation(task.points[i + 1].waypoint.location);
          direction = turf.bearing(location, locNext);

        } else if (i === task.points.length - 1) {
          let locPrev = convertLocation(task.points[i - 1].waypoint.location);
          direction = turf.bearing(locPrev, location);

        } else {
          let locPrev = convertLocation(task.points[i - 1].waypoint.location);
          let locNext = convertLocation(task.points[i + 1].waypoint.location);

          let bearingFromPrev = turf.bearing(locPrev, location);
          let bearingToNext = turf.bearing(location, locNext);

          direction = turf.bearingToAngle((bearingToNext + bearingFromPrev) / 2);
        }

        observationZone = new Line(location, point.observation_zone.length!, direction);

      } else if (point.observation_zone.type === 'Cylinder') {
        observationZone = new Cylinder(location, point.observation_zone.radius!);
      } else {
        throw new Error(`Unknown zone type: ${point.observation_zone.type}`);
      }

      return new Turnpoint(observationZone);
    }),
  };
}

function convertLocation(loc: XCSoarLocation): GeoJSON.Position {
  return [loc.longitude, loc.latitude];
}

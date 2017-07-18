import * as fs from "fs";
import * as turf from "@turf/turf";

import {Turnpoint} from "./turnpoint";
import {Cylinder, Keyhole, Line} from "./task/shapes";
import {read, XCSoarLocation} from "./xcsoar";
import Task from "./task/task";
import Point from "./geo/point";
import {fraction} from "./utils/angles";

export function readTask(path: string): Task {
  let file = fs.readFileSync(path, 'utf8');
  let task = read(file);

  let points = task.points.map((point, i) => {
    let location = convertLocation(point.waypoint.location);

    if (point.observation_zone.type === 'Cylinder') {
      return new Cylinder(location, point.observation_zone.radius!);
    }

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

      let bearingtoPrev = turf.bearing(location, locPrev);
      let bearingToNext = turf.bearing(location, locNext);

      let bisector = fraction(bearingtoPrev, bearingToNext);

      direction = bisector - 90;
    }

    if (point.observation_zone.type === 'Line') {
      return new Line(location, point.observation_zone.length!, direction);
    }

    if (point.observation_zone.type === 'Keyhole') {
      return new Keyhole(location, direction - 90);
    }

    throw new Error(`Unknown zone type: ${point.observation_zone.type}`);
  }).map(oz => new Turnpoint(oz));

  return new Task(points, {
    isAAT: task.type === 'AAT',
    aatMinTime: task.aat_min_time,
  });
}

function convertLocation(loc: XCSoarLocation): Point {
  return [loc.longitude, loc.latitude];
}

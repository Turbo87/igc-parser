import * as fs from "fs";
import * as turf from "@turf/turf";

import * as oz from "./oz";
import {Turnpoint} from "./turnpoint";
import {Cylinder, Line, ObservationZone} from "./oz";
import {read, XCSoarLocation, XCSoarObservationZone} from "./xcsoar/task-reader";

export interface Task {
  type: string,
  aatMinTime: number,
  points: Turnpoint[],
}

export function readTask(path): Task {
  let file = fs.readFileSync(path, 'utf8');
  let task = read(file);

  return {
    type: task.type,
    aatMinTime: task.aat_min_time,
    points: task.points.map((point, i) => {
      let name = point.waypoint.name;
      let altitude = point.waypoint.altitude;
      let location = convertLocation(point.waypoint.location);
      let observationZone = convertOZ(point.observation_zone, location);

      let bearing;
      if (i === 0) {
        let locNext = convertLocation(task.points[i + 1].waypoint.location);
        bearing = turf.bearing(location, locNext);

      } else if (i === task.points.length - 1) {
        let locPrev = convertLocation(task.points[i - 1].waypoint.location);
        bearing = turf.bearing(locPrev, location);

      } else {
        let locPrev = convertLocation(task.points[i - 1].waypoint.location);
        let locNext = convertLocation(task.points[i + 1].waypoint.location);

        let bearingFromPrev = turf.bearing(locPrev, location);
        let bearingToNext = turf.bearing(location, locNext);

        bearing = turf.bearingToAngle((bearingToNext + bearingFromPrev) / 2);
      }

      if (observationZone instanceof oz.Line) {
        observationZone.direction = bearing;
        observationZone.update();
      }

      return new Turnpoint(name, altitude, location, observationZone);
    }),
  };
}

function convertLocation(loc: XCSoarLocation): GeoJSON.Position {
  return [loc.longitude, loc.latitude];
}

function convertOZ(oz: XCSoarObservationZone, loc: GeoJSON.Position): ObservationZone {
  if (oz.type === 'Line') {
    return new Line(loc, oz.length!);
  } else if (oz.type === 'Cylinder') {
    return new Cylinder(loc, oz.radius!);
  } else {
    throw new Error(`Unknown zone type: ${oz.type}`);
  }
}

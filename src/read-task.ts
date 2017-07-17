import * as fs from "fs";
import * as turf from "@turf/turf";
import {xml2js} from "xml-js";

import * as oz from "./oz";
import {Turnpoint} from "./turnpoint";
import {ObservationZone} from "./oz";

export interface Task {
  type: string,
  aatMinTime: number,
  points: Turnpoint[],
}

export function readTask(path): Task {
  let file = fs.readFileSync(path, 'utf8');
  let xml = xml2js(file);
  let task = convertTask(xml.elements.find(it => it.name === 'Task'));

  task.points.forEach((tp, i) => {
    let bearing;
    if (i === 0) {
      let locNext = task.points[i + 1].location;
      bearing = turf.bearing(tp.location, locNext);

    } else if (i === task.points.length - 1) {
      let locPrev = task.points[i - 1].location;
      bearing = turf.bearing(locPrev, tp.location);

    } else {
      let locPrev = task.points[i - 1].location;
      let locNext = task.points[i + 1].location;

      let bearingFromPrev = turf.bearing(locPrev, tp.location);
      let bearingToNext = turf.bearing(tp.location, locNext);

      bearing = turf.bearingToAngle((bearingToNext + bearingFromPrev) / 2);
    }

    if (tp.observationZone instanceof oz.Line) {
      tp.observationZone.bearing = bearing;
      tp.observationZone.update();
    }
  });

  return task;
}

function convertTask(xml): Task {
  return {
    type: xml.attributes.type,
    aatMinTime: parseInt(xml.attributes.aat_min_time),
    points: xml.elements.map(convertPoint),
  };
}

function convertPoint(xml): Turnpoint {
  let waypoint = convertWaypoint(xml.elements.find(it => it.name === 'Waypoint'));
  let observationZone = convertObservationZone(xml.elements.find(it => it.name === 'ObservationZone'), waypoint.location);

  return new Turnpoint(waypoint.name, waypoint.altitude, waypoint.location, observationZone);
}

function convertWaypoint(xml) {
  return {
    name: xml.attributes.name,
    altitude: parseFloat(xml.attributes.altitude),
    location: convertLocation(xml.elements.find(it => it.name === 'Location')),
  };
}

function convertLocation(xml): GeoJSON.Position {
  return [parseFloat(xml.attributes.longitude), parseFloat(xml.attributes.latitude)];
}

function convertObservationZone(xml, location: GeoJSON.Position): ObservationZone | undefined {
  let type = xml.attributes.type;

  if (type === 'Line') {
    let length = parseFloat(xml.attributes.length);
    return new oz.Line(location, length);

  } else if (type === 'Cylinder') {
    let radius = parseFloat(xml.attributes.radius);
    return new oz.Cylinder(location, radius);
  }
}

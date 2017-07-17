const fs = require('fs');
const xml2js = require('xml-js').xml2js;
const turf = require('@turf/turf');

const oz = require('./oz');
const Turnpoint = require('./turnpoint').Turnpoint;

export function readTask(path) {
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

    tp.observationZone.bearing = bearing;

    if (tp.observationZone.update) {
      tp.observationZone.update();
    }
  });

  return task;
}

function convertTask(xml) {
  return {
    type: xml.attributes.type,
    aatMinTime: parseInt(xml.attributes.aat_min_time),
    points: xml.elements.map(convertPoint),
  };
}

function convertPoint(xml) {
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

function convertLocation(xml) {
  return [parseFloat(xml.attributes.longitude), parseFloat(xml.attributes.latitude)];
}

function convertObservationZone(xml, location) {
  let type = xml.attributes.type;

  if (type === 'Line') {
    let length = parseFloat(xml.attributes.length);
    return new oz.Line(location, length);

  } else if (type === 'Cylinder') {
    let radius = parseFloat(xml.attributes.radius);
    return new oz.Cylinder(location, radius);
  }
}

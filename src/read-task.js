const fs = require('fs');
const xml2js = require('xml-js').xml2js;

const oz = require('./oz');

function readTask(path) {
  let file = fs.readFileSync(path, 'utf8');
  let xml = xml2js(file);
  return convertTask(xml.elements.find(it => it.name === 'Task'));
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

  return {
    type: xml.attributes.type,
    waypoint,
    observationZone,
  };
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

module.exports = readTask;

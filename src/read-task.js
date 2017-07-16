const fs = require('fs');
const xml2js = require('xml-js').xml2js;

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
  return {
    type: xml.attributes.type,
    waypoint: convertWaypoint(xml.elements.find(it => it.name === 'Waypoint')),
    observationZone: convertObservationZone(xml.elements.find(it => it.name === 'ObservationZone')),
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

function convertObservationZone(xml) {
  let type = xml.attributes.type;

  if (type === 'Line') {
    let length = parseFloat(xml.attributes.length);
    return { type, length };

  } else if (type === 'Cylinder') {
    let radius = parseFloat(xml.attributes.radius);
    return { type, radius };
  }
}

module.exports = readTask;

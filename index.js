const fs = require('fs');
const turf = require('@turf/turf');

const readTask = require('./src/read-task');
const taskToGeoJSON = require('./src/task-to-geojson');
const readFlight = require('./src/read-flight');
const analyzeFlight = require('./src/analyze-flight');
const formatResult = require('./src/format-result');
const viewGeoJSON = require('./src/view-geojson');

let task = readTask(`${__dirname}/fixtures/2017-07-15-lev/task.tsk`);

let flights = fs.readdirSync(`${__dirname}/fixtures/2017-07-15-lev`).filter(filename => (/\.igc$/i).test(filename)).map(filename => {
  let callsign = filename.match(/^(.{1,3})_/)[1];
  let flight = readFlight(`${__dirname}/fixtures/2017-07-15-lev/${filename}`);
  let result = analyzeFlight(flight, task);

  return { filename, result, callsign };
}).sort(compareSpeed);

function compareSpeed(a, b) {
  return b.result.speed - a.result.speed;
}

flights.forEach(flight => {
  console.log(`${flight.callsign}: ${flight.result.speed} km/h`);
});
console.log();

let flight = readFlight(`${__dirname}/fixtures/2017-07-15-lev/sq_2017-07-15-fla-3jv-01.igc`);
let flight2 = readFlight(`${__dirname}/fixtures/2017-07-15-lev/IGP_77fg7sd1.igc`);
let result = analyzeFlight(flight, task);

console.log(formatResult(result));

let json = taskToGeoJSON(task);
json.features.push(turf.lineString(flight.map(it => it.coordinate), { color: 'red', opacity: 0.85 }));
json.features.push(turf.lineString(flight2.map(it => it.coordinate), { color: 'green', opacity: 0.85 }));
json.features.push(...result.aatPoints.filter(Boolean).map(it => turf.point(it.coordinate)));

if (process.argv.indexOf('--view') !== -1) {
  viewGeoJSON(json);
}

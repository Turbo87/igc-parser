const fs = require('fs');
const turf = require('@turf/turf');

const readTask = require('../src/read-task');
const readFlight = require('../src/read-flight');
const analyzeFlight = require('../src/analyze-flight');

let task = readTask(`${__dirname}/../fixtures/2017-07-15-lev/task.tsk`);

let flights = fs.readdirSync(`${__dirname}/../fixtures/2017-07-15-lev`).filter(filename => (/\.igc$/i).test(filename)).map(filename => {
  let callsign = filename.match(/^(.{1,3})_/)[1];
  let flight = readFlight(`${__dirname}/../fixtures/2017-07-15-lev/${filename}`);
  let result = analyzeFlight(flight, task);

  return { filename, result, callsign };
}).sort(compareSpeed);

function compareSpeed(a, b) {
  return b.result.speed - a.result.speed;
}

flights.forEach(flight => {
  console.log(`${flight.callsign}: ${flight.result.speed} km/h`);
});

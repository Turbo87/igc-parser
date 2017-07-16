const turf = require('@turf/turf');

const readTask = require('./src/read-task');
const taskToGeoJSON = require('./src/task-to-geojson');
const readFlight = require('./src/read-flight');
const analyzeFlight = require('./src/analyze-flight');
const viewGeoJSON = require('./src/view-geojson');

let task = readTask(`${__dirname}/fixtures/2017-07-15-lev/task.tsk`);
let flight = readFlight(`${__dirname}/fixtures/2017-07-15-lev/SW_77flqgg1.igc`);
let result = analyzeFlight(flight, task);

let json = taskToGeoJSON(task);
json.features.push(turf.lineString(flight, { color: 'red', opacity: 0.85 }));
json.features.push(...result.starts.map(it => it.point));

viewGeoJSON(json);

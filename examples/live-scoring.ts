import Point from '../src/geo/point';
import GliderTrackerClient from '../src/glidertracker/client';
import {Fix} from '../src/read-flight';
import {readTask} from '../src/read-task';
import RacingTaskSolver from '../src/task/solver/racing-task-solver';
import {readCSV} from './utils/read-csv';

const logUpdate = require('log-update');

let now = new Date();
let day = now.getDate();
let month = now.getMonth() + 1;
let date = `${now.getFullYear()}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day}`;

let from = Date.parse(`${date}T00:00:00`);
let to = Date.now();

if (process.argv.length < 4) {
  console.log('Usage: ts-node examples/live-scoring.ts TASK_PATH CSV_PATH');
  process.exit(1);
}

let taskPath = process.argv[2];
let task = readTask(taskPath);

if (task.options.isAAT) {
  console.log('AAT tasks are not supported yet');
  process.exit(1);
}

let flarmIds = readCSV(process.argv[3]);

let fixesById = new Map<string, Fix[]>();
for (let flarmId of Object.keys(flarmIds)) {
  fixesById.set(flarmId, []);
}

let client = new GliderTrackerClient({ WebSocket: require('ws') });

function connect() {
  client.connect().then(() => {
    client.setView(task.bbox);

    for (let flarmId of Object.keys(flarmIds)) {
      let id = flarmId.replace(/^FLR/, '06');
      client.requestTrack(id, from, to);
    }
  });
}

connect();

client.onClose = function() {
  console.log('Reconnecting...');
  connect();
};

client.onTrack = function(id, _fixes) {
  let flarmId = id.replace(/^06/, 'FLR');

  let fixes = fixesById.get(flarmId);
  if (fixes) {
    fixes.push(..._fixes.map(fix => ({
      time: fix.time,
      coordinate: [fix.lon, fix.lat] as Point,
      valid: true,
      altitude: fix.alt / 10 * 3,
    })));
  }
};

client.onRecord = function(record) {
  let flarmMapping = flarmIds[record.from.call];
  if (!flarmMapping)
    return;

  let fixes = fixesById.get(record.from.call);

  let data = record.data;
  if (fixes && data) {
    fixes.push({
      time: Date.parse(data.timestamp),
      coordinate: [parseFloat(data.longitude), parseFloat(data.latitude)],
      valid: true,
      altitude: data.altitude,
    });
  }
};

setInterval(() => {
  let lines = Object.keys(flarmIds).map(flarmId => {
    let flarmMapping = flarmIds[flarmId];
    let fixes = fixesById.get(flarmId)!;

    let solver = new RacingTaskSolver(task);
    solver.consume(fixes);
    let result = solver.result;

    let distance = result.distance !== undefined ? `${(result.distance / 1000).toFixed(1)} km` : '';
    let speed = result.speed !== undefined ? `${(result.speed).toFixed(2)} km/h` : '';

    return `${flarmMapping.cn}\t${distance}\t${speed}`;
  });

  logUpdate(lines.join('\n'));
}, 100);

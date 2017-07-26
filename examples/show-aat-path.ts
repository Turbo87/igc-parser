import turf = require('@turf/helpers');

import {readFlight} from '../src/read-flight';
import {readTask} from '../src/read-task';
import {taskToGeoJSON} from '../src/task-to-geojson';
import AreaTaskSolver from '../src/task/solver/area-task-solver';
import {viewGeoJSON} from './utils/view-geojson';

if (process.argv.length < 4) {
  console.log('Usage: ts-node examples/show-aat-path.ts TASK_PATH IGC_PATH');
  process.exit(1);
}

let taskPath = process.argv[2];
let task = readTask(taskPath);

if (!task.options.isAAT) {
  console.log('Only AAT tasks are supported');
  process.exit(1);
}

let flightPath = process.argv[3];
let flight = readFlight(flightPath);

let solver = new AreaTaskSolver(task);

solver.consume(flight);

let path = solver.result!.path;

let json = taskToGeoJSON(task);
json.features.push(turf.lineString(flight.map(it => it.coordinate), { color: 'red', opacity: 0.85 }));
json.features.push(turf.lineString(path.map(it => it.coordinate), { color: '#00ff00', opacity: 0.85 }));

viewGeoJSON(json);

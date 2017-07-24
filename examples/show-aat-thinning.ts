import * as turf from "@turf/turf";

import {readTask} from "../src/read-task";
import {readFlight} from "../src/read-flight";
import AreaTaskSolver from "../src/task/solver/area-task-solver";
import {taskToGeoJSON} from "../src/task-to-geojson";
import {viewGeoJSON} from "./utils/view-geojson";

if (process.argv.length < 4) {
  console.log('Usage: ts-node examples/analyze-flight.ts TASK_PATH IGC_PATH');
  process.exit(1);
}

let taskPath = process.argv[2];
let task = readTask(taskPath);

if (!task.options.isAAT) {
  console.log('This example only works for AAT tasks');
  process.exit(1);
}

let flightPath = process.argv[3];
let flight = readFlight(flightPath);

let solver = new AreaTaskSolver(task);
solver.consume(flight);

let json = taskToGeoJSON(task);
json.features.push(turf.lineString(flight.map(it => it.coordinate), { color: 'red', opacity: 0.85 }));
solver.thinnedAreas.forEach(thinnedFixes => {
  let coords = thinnedFixes.concat(thinnedFixes[0]).filter(Boolean).map(it => it.coordinate);
  if (coords.length >= 2) {
    json.features.push(turf.lineString(coords, { color: '#00FF00', opacity: 0.85 }));
  }
});

viewGeoJSON(json);

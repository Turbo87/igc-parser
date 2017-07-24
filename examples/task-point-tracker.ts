import * as turf from "@turf/turf";

import {readTask} from "../src/read-task";
import {readFlight} from "../src/read-flight";
import {taskToGeoJSON} from "../src/task-to-geojson";
import {viewGeoJSON} from "./utils/view-geojson";
import TaskPointTracker from "../src/task/task-point-tracker";

if (process.argv.length < 4) {
  console.log('Usage: ts-node examples/task-point-tracker.ts TASK_PATH IGC_PATH');
  process.exit(1);
}

let taskPath = process.argv[2];
let task = readTask(taskPath);

let flightPath = process.argv[3];
let flight = readFlight(flightPath);

let tracker = new TaskPointTracker(task);
tracker.consume(flight);

let json = taskToGeoJSON(task);
json.features.push(turf.lineString(flight.map(it => it.coordinate), { color: 'red', opacity: 0.85 }));
json.features.push(turf.multiPoint(tracker.events.map(event => event.point)));

viewGeoJSON(json);

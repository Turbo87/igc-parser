import turf = require('@turf/helpers');

import {readFlight} from '../src/read-flight';
import {readTask} from '../src/read-task';
import {taskToGeoJSON} from '../src/task-to-geojson';
import TaskPointTracker from '../src/task/task-point-tracker';
import {viewGeoJSON} from './utils/view-geojson';

if (process.argv.length < 4) {
  console.log('Usage: ts-node examples/task-point-tracker.ts TASK_PATH IGC_PATH');
  process.exit(1);
}

let taskPath = process.argv[2];
let task = readTask(taskPath);

let flightPath = process.argv[3];
let flight = readFlight(flightPath);

let tracker = new TaskPointTracker(task, { trackConvexHull: task.options.isAAT });
tracker.consume(flight);

let json = taskToGeoJSON(task);
json.features.push(turf.lineString(flight.map(it => it.coordinate), { color: 'red', opacity: 0.85 }));

json.features.push(turf.multiPoint(tracker.starts.map(fix => fix.coordinate)));

tracker.areaVisits.forEach(areaVisits => {
  json.features.push(turf.multiPoint(areaVisits.map(visit => visit.enter.coordinate)));

  if (task.options.isAAT) {
    areaVisits.forEach(visit => {
      let coords = visit.fixes.concat(visit.fixes[0]).filter(Boolean).map(it => it.coordinate);
      if (coords.length >= 2) {
        json.features.push(turf.lineString(coords, {color: '#00FF00', opacity: 0.85}));
      }
    });
  }
});

if (tracker.finish)
  json.features.push(turf.point(tracker.finish.coordinate));

viewGeoJSON(json);

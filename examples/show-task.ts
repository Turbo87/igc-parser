import {readTask} from '../src/read-task';
import {taskToGeoJSON} from '../src/task-to-geojson';
import {viewGeoJSON} from './utils/view-geojson';

if (process.argv.length < 3) {
  console.log('Usage: ts-node examples/show-task.ts TASK_PATH');
  process.exit(1);
}

let taskPath = process.argv[2];
let task = readTask(taskPath);

let json = taskToGeoJSON(task);

viewGeoJSON(json);

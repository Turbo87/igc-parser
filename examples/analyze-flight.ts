import {readTask} from "../src/read-task";
import {readFlight} from "../src/read-flight";
import {analyzeFlight} from "../src/analyze-flight";

if (process.argv.length < 4) {
  console.log('Usage: ts-node examples/analyze-flight.ts TASK_PATH IGC_PATH');
  process.exit(1);
}

let taskPath = process.argv[2];
let task = readTask(taskPath);

let flightPath = process.argv[3];
let flight = readFlight(flightPath);

console.log(analyzeFlight(flight, task));

import {readTask} from "../src/read-task";
import {Fix, readFlight} from "../src/read-flight";
import RacingTaskSolver from "../src/racing-task-solver";
import {formatTime} from "../src/format-result";

if (process.argv.length < 4) {
  console.log('Usage: ts-node examples/analyze-flight.ts TASK_PATH IGC_PATH');
  process.exit(1);
}

let taskPath = process.argv[2];
let task = readTask(taskPath);

let flightPath = process.argv[3];
let flight = readFlight(flightPath);

if (task.options.isAAT) {
  console.log('AAT tasks are not supported yet');
  process.exit(1);
}

let solver = new RacingTaskSolver(task);

solver.on('start', (fix: Fix) => console.log(`Start at ${formatTime(fix.time)}`));
solver.on('turn', (fix: Fix, i: number) => console.log(`Reached TP${i} at ${formatTime(fix.time)}`));
solver.on('finish', (fix: Fix) => console.log(`Finish at ${formatTime(fix.time)}`));

solver.consume(flight);

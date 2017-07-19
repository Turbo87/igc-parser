import {readTask} from "../src/read-task";
import {readFlight} from "../src/read-flight";
import RacingTaskSolver from "../src/task/solver/racing-task-solver";
import {formatTime} from "../src/format-result";
import {TurnEvent} from "../src/task/events";

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

solver.on('start', event => console.log(`Start at ${formatTime(event.time)}`));
solver.on('turn', (event: TurnEvent) => console.log(`Reached TP${event.num} at ${formatTime(event.time)}`));
solver.on('finish', event => console.log(`Finish at ${formatTime(event.time)}`));

solver.consume(flight);

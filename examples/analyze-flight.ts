import {formatTime} from '../src/format-result';
import {readFlight} from '../src/read-flight';
import {readTask} from '../src/read-task';
import {FinishEvent, StartEvent, TurnEvent} from '../src/task/events';
import AreaTaskSolver from '../src/task/solver/area-task-solver';
import RacingTaskSolver from '../src/task/solver/racing-task-solver';

if (process.argv.length < 4) {
  console.log('Usage: ts-node examples/analyze-flight.ts TASK_PATH IGC_PATH');
  process.exit(1);
}

let taskPath = process.argv[2];
let task = readTask(taskPath);

let flightPath = process.argv[3];
let flight = readFlight(flightPath);

if (task.options.isAAT) {
  let solver = new AreaTaskSolver(task);

  solver.consume(flight);

  console.log(solver.result);

} else {
  let solver = new RacingTaskSolver(task);

  solver.consume(flight);

  solver.events.forEach(event => {
    if (event instanceof StartEvent)
      console.log(`Start at ${formatTime(event.time)}`);

    if (event instanceof TurnEvent)
      console.log(`Reached TP${event.num} at ${formatTime(event.time)}`);

    if (event instanceof FinishEvent)
      console.log(`Finish at ${formatTime(event.time)}`);
  });
}

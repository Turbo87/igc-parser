import {Fix} from "./read-flight";
import Task from "./task/task";
import RacingTaskSolver from "./task/solver/racing-task-solver";
import AreaTaskSolver from "./task/solver/area-task-solver";

export function analyzeFlight(flight: Fix[], task: Task) {
  if (task.options.isAAT) {
    let analyzer = new AreaTaskSolver(task);
    analyzer.consume(flight);
    return analyzer.result;
  } else {
    let analyzer = new RacingTaskSolver(task);
    analyzer.consume(flight);
    return analyzer.result;
  }
}

import {readTask} from "../src/read-task";
import RacingTaskSolver from "../src/task/solver/racing-task-solver";
import Task from "../src/task/task";
import {readFlight} from "../src/read-flight";

describe('RacingTaskSolver', () => {
  describe('with task "2017-07-17-lev.tsk"', () => {
    let task: Task;
    let solver: RacingTaskSolver;

    beforeEach(() => {
      task = readTask(`${__dirname}/../fixtures/2017-07-17-lev.tsk`);
      solver = new RacingTaskSolver(task);
    });

    it('returns a result', () => {
      let flight = readFlight(`${__dirname}/../fixtures/2017-07-17-lev/IGP_77hg7sd1.IGC`);
      solver.consume(flight);
      expect(solver.result).toMatchSnapshot();
    });

    it('can handle outlandings', () => {
      let flight = readFlight(`${__dirname}/../fixtures/2017-07-17-lev/ZG_77hv6ci1.igc`);
      solver.consume(flight);
      expect(solver.result).toMatchSnapshot();
    })
  });
});

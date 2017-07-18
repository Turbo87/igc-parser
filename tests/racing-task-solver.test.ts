import {readTask} from "../src/read-task";
import RacingTaskSolver from "../src/racing-task-solver";
import Task from "../src/task";
import {Fix, readFlight} from "../src/read-flight";

describe('RacingTaskSolver', () => {
  describe('with task "2017-07-17-lev.tsk"', () => {
    let task: Task;
    let solver: RacingTaskSolver;
    let flight: Fix[];

    beforeEach(() => {
      task = readTask(`${__dirname}/../fixtures/2017-07-17-lev.tsk`);
      solver = new RacingTaskSolver(task);
      flight = readFlight(`${__dirname}/../fixtures/2017-07-17-lev/IGP_77hg7sd1.IGC`);
    });

    it('emits multiple start events', () => {
      let fixes: Fix[] = [];
      solver.on('start', fix => fixes.push(fix));
      solver.consume(flight);
      expect(fixes).toMatchSnapshot();
    });

    it('emits multiple turn events', () => {
      let fixes = [];
      solver.on('turn', (fix, i) => fixes.push([fix, i]));
      solver.consume(flight);
      expect(fixes).toMatchSnapshot();
    });

    it('emits single finish event', () => {
      let fixes: Fix[] = [];
      solver.on('finish', fix => fixes.push(fix));
      solver.consume(flight);
      expect(fixes).toMatchSnapshot();
    });

    it('returns a result', () => {
      solver.consume(flight);
      expect(solver.result).toMatchSnapshot();
    });

    it('can handle outlandings', () => {
      flight = readFlight(`${__dirname}/../fixtures/2017-07-17-lev/ZG_77hv6ci1.igc`);
      solver.consume(flight);
      expect(solver.result).toMatchSnapshot();
    })
  });
});

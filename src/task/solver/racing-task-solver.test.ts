import {readFlight} from '../../read-flight';
import {readTask} from '../../read-task';
import Task from '../task';
import RacingTaskSolver from './racing-task-solver';

const FIXTURES_PATH = `${__dirname}/../../../fixtures`;

describe('RacingTaskSolver', () => {
  describe('with task "2017-07-17-lev.tsk"', () => {
    let task: Task;
    let solver: RacingTaskSolver;

    beforeEach(() => {
      task = readTask(`${FIXTURES_PATH}/2017-07-17-lev.tsk`);
      solver = new RacingTaskSolver(task);
    });

    it('returns a result', () => {
      let flight = readFlight(`${FIXTURES_PATH}/2017-07-17-lev/IGP_77hg7sd1.IGC`);
      solver.consume(flight);
      expect(solver.result).toMatchSnapshot();
    });

    it('returns an intermediate result', () => {
      let flight = readFlight(`${FIXTURES_PATH}/2017-07-17-lev/IGP_77hg7sd1.IGC`);
      let part1 = flight.slice(0, 1500);
      let part2 = flight.slice(1500);
      solver.consume(part1);
      expect(solver.result).toMatchSnapshot();
      solver.consume(part2);
      expect(solver.result).toMatchSnapshot();
    });

    it('can handle outlandings', () => {
      let flight = readFlight(`${FIXTURES_PATH}/2017-07-17-lev/ZG_77hv6ci1.igc`);
      solver.consume(flight);
      expect(solver.result).toMatchSnapshot();
    });
  });
});

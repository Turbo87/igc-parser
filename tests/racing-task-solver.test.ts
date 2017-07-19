import {readTask} from "../src/read-task";
import RacingTaskSolver from "../src/task/solver/racing-task-solver";
import Task from "../src/task/task";
import {Fix, readFlight} from "../src/read-flight";
import {Event} from "../src/task/events";

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
      let events: Event[] = [];
      solver.on('start', event => events.push(event));
      solver.consume(flight);
      expect(events).toMatchSnapshot();
    });

    it('emits multiple turn events', () => {
      let events: Event[] = [];
      solver.on('turn', (event) => events.push(event));
      solver.consume(flight);
      expect(events).toMatchSnapshot();
    });

    it('emits single finish event', () => {
      let events: Event[] = [];
      solver.on('finish', event => events.push(event));
      solver.consume(flight);
      expect(events).toMatchSnapshot();
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

import {readTask} from "../src/read-task";
import {taskToGeoJSON} from "../src/task-to-geojson";

describe('taskToGeoJSON()', () => {
  it('converts "2017-07-15-lev" task correctly', () => {
    let task = readTask(`${__dirname}/../fixtures/2017-07-15-lev.tsk`);
    let geojson = taskToGeoJSON(task);
    expect(geojson).toMatchSnapshot();
  })
});

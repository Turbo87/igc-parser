const readTask = require('../src/read-task').readTask;
const taskToGeoJSON = require('../src/task-to-geojson').taskToGeoJSON;

describe('taskToGeoJSON()', () => {
  it('converts "2017-07-15-lev" task correctly', () => {
    let task = readTask(`${__dirname}/../fixtures/2017-07-15-lev/task.tsk`);
    let geojson = taskToGeoJSON(task);
    expect(geojson).toMatchSnapshot();
  })
});

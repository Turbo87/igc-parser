const readTask = require('./read-task');

describe('readTask()', () => {
  it('reads "2017-07-15-lev" task correctly', () => {
    let task = readTask(`${__dirname}/../fixtures/2017-07-15-lev/task.tsk`);
    expect(task).toMatchSnapshot();
  })
});

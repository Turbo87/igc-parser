const readTask = require('./src/read-task');
const taskToGeoJSON = require('./src/task-to-geojson');
const viewGeoJSON = require('./src/view-geojson');

let task = readTask(`${__dirname}/fixtures/2017-07-15-lev/task.tsk`);
let json = taskToGeoJSON(task);

viewGeoJSON(json);

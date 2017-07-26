import turf = require('@turf/helpers');
import Task from './task/task';

export function taskToGeoJSON(task: Task) {
  let legs = turf.lineString(task.points.map(pt => pt.shape.center));
  let ozs = task.points.map(pt => pt.shape.toGeoJSON());

  return turf.featureCollection([legs, ...ozs]);
}

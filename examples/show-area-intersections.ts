import turf = require('@turf/turf');

import {interpolatePoint} from '../src/geo/interpolate-point';
import Point from '../src/geo/point';
import {readFlight} from '../src/read-flight';
import {readTask} from '../src/read-task';
import {taskToGeoJSON} from '../src/task-to-geojson';
import AreaShape from '../src/task/shapes/area';
import Line from '../src/task/shapes/line';
import {viewGeoJSON} from './utils/view-geojson';

if (process.argv.length < 4) {
  console.log('Usage: ts-node examples/show-area-intersections.ts TASK_PATH IGC_PATH');
  process.exit(1);
}

let taskPath = process.argv[2];
let task = readTask(taskPath);

let flightPath = process.argv[3];
let flight = readFlight(flightPath);

let points: Point[] = [];
for (let i = 1; i < flight.length; i++) {
  let lastFix = flight[i - 1];
  let fix = flight[i];

  task.points.forEach(point => {
    let shape = point.shape;
    if (shape instanceof Line) {
      let fraction = shape.checkTransition(lastFix.coordinate, fix.coordinate);
      if (fraction !== undefined)
        points.push(interpolatePoint(lastFix.coordinate, fix.coordinate, fraction));

    } else if (shape instanceof AreaShape) {
      let fractions = shape.findIntersections(lastFix.coordinate, fix.coordinate);
      let areaPoints = fractions.map(fraction => interpolatePoint(lastFix.coordinate, fix.coordinate, fraction));
      points = points.concat(areaPoints);
    }
  });
}

let json = taskToGeoJSON(task);
json.features.push(turf.lineString(flight.map(it => it.coordinate), { color: 'red', opacity: 0.85 }));
json.features.push(turf.multiPoint(points, { color: 'red', opacity: 0.85 }));

viewGeoJSON(json);

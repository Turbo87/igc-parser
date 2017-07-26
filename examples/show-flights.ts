import * as turf from '@turf/turf';

import {analyzeFlight} from '../src/analyze-flight';
import {readFlight} from '../src/read-flight';
import {readTask} from '../src/read-task';
import {taskToGeoJSON} from '../src/task-to-geojson';
import {viewGeoJSON} from './utils/view-geojson';

let task = readTask(`${__dirname}/../fixtures/2017-07-17-lev.tsk`);
let flight = readFlight(`${__dirname}/../fixtures/2017-07-17-lev/ZG_77hv6ci1.igc`);
let result = analyzeFlight(flight, task);

let json = taskToGeoJSON(task);
json.features.push(turf.lineString(flight.map(it => it.coordinate), { color: 'red', opacity: 0.85 }));

if (process.argv.indexOf('--view') !== -1) {
  viewGeoJSON(json);
}

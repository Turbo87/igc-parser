import * as fs from "fs";

import {readTask} from "../src/read-task";
import {readFlight} from "../src/read-flight";
import {analyzeFlight} from "../src/analyze-flight";
import RacingTaskSolver from "../src/task/solver/racing-task-solver";
import {formatTime} from "../src/format-result";

const logUpdate = require('log-update');

if (process.argv.length < 4) {
  console.log('Usage: ts-node examples/analyze-flight.ts TASK_PATH IGC_FOLDER');
  process.exit(1);
}

let taskPath = process.argv[2];
let task = readTask(taskPath);

if (task.options.isAAT) {
  console.log('AAT tasks are not supported yet');
  process.exit(1);
}

let handicaps = readCSV(`${__dirname}/../fixtures/2017-lev.csv`);

let flightsPath = process.argv[3];

let callsigns: string[] = [];
let flights: any = {};
let solvers: any = {};
let indexes: any = {};

fs.readdirSync(flightsPath)
  .filter(filename => (/\.igc$/i).test(filename))
  .forEach(filename => {
    let callsign = filename.match(/^(.{1,3})_/)![1];

    callsigns.push(callsign.toUpperCase());

    flights[callsign.toUpperCase()] = readFlight(`${flightsPath}/${filename}`);
    solvers[callsign.toUpperCase()] = new RacingTaskSolver(task);
    indexes[callsign.toUpperCase()] = 0;
  });

let times = Object.keys(flights).map(key => flights[key]).map(flight => ({
  min: flight[0].time,
  max: flight[flight.length - 1].time,
}));

let minTime = Math.min(...times.map(it => it.min)) / 1000;
let maxTime = Math.max(...times.map(it => it.max)) / 1000;

for (let time = minTime; time <= maxTime; time++) {
  callsigns.forEach(callsign => {
    let index = indexes[callsign];
    let flight = flights[callsign];
    let solver = solvers[callsign];

    while (true) {
      let fix = flight[index];
      if (fix && fix.time / 1000 <= time) {
        index++;
        solver.update(fix);
      } else {
        break;
      }
    }

    indexes[callsign] = index;
  });

  let results = callsigns.map(callsign => {
    let solver = solvers[callsign] as RacingTaskSolver;
    let result = solver.result;

    let handicap = handicaps[callsign.toUpperCase()];
    let handicapFactor = 100 / handicap;

    let { distance, speed } = result;
    if (distance !== undefined) distance *= handicapFactor;
    if (speed !== undefined) speed *= handicapFactor;

    return { callsign, handicap, result, distance, speed };
  }).sort(compareResults);

  let lines = results.map((result: any) => {
    let distance = result.result.distance !== undefined ? `${(result.result.distance / 1000).toFixed(1)} km` : '';
    let speed = result.result.speed !== undefined ? `${(result.result.speed).toFixed(2)} km/h` : '';

    return `${result.callsign}\t${result.handicap}\t${distance}\t${speed}`;
  });

  let output = `Time: ${formatTime(time * 1000)}\n\n${lines.join('\n')}`;
  logUpdate(output);
}

function compareResults(a: any, b: any) {
  if (a.speed !== undefined && b.speed !== undefined)
    return b.speed - a.speed;

  if (a.speed !== undefined && b.speed === undefined)
    return -1;

  if (a.speed === undefined && b.speed !== undefined)
    return 1;

  return b.distance - a.distance;
}

function readCSV(path: string) {
  let lines = fs.readFileSync(path, 'utf8').split('\n');
  lines.shift();

  let handicaps = Object.create(null);
  lines.map(line => line.trim().split(',')).forEach(([id, _, cn, type, handicap]) => {
    if (id) {
      handicaps[cn] = parseInt(handicap);
    }
  });
  return handicaps;
}

import turf = require('@turf/helpers');
import GliderTrackerClient from '../src/glidertracker/client';
import {viewGeoJSON} from './utils/view-geojson';

if (process.argv.length < 3) {
  console.log('Usage: ts-node examples/glidertracker-history.ts FLARM_ID [YYYY-MM-DD]');
  process.exit(1);
}

let flarmId = process.argv[2];

let date = process.argv[3];
if (!date) {
  let now = new Date();
  let day = now.getDate();
  let month = now.getMonth() + 1;
  date = `${now.getFullYear()}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day}`;
}

let from = Date.parse(`${date}T00:00:00`);
let to = Date.parse(`${date}T23:59:59`);

let timer: NodeJS.Timer;
let fixes: any[] = [];
let client = new GliderTrackerClient({ WebSocket: require('ws') });

console.log('Connecting...');
client.connect().then(() => {
  timer = setTimeout(finish, 1000);
  console.log(`Requesting track for ${flarmId}...`);
  client.requestTrack(flarmId, from, to);
});

client.onTrack = function(id, _fixes) {
  if (timer)
    clearTimeout(timer);

  console.log(`${_fixes.length} new GPS fixes received...`);
  fixes.push(..._fixes);

  timer = setTimeout(finish, 1000);
};

function finish() {
  console.log('Disconnecting...');
  client.disconnect();

  if (fixes.length < 2) {
    console.log();
    console.log('No track found :(');

  } else {
    let json = turf.lineString(fixes.map(it => [it.lon, it.lat]), { color: 'red', opacity: 0.85 });

    viewGeoJSON(json);
  }
}

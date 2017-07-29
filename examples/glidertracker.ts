import GliderTrackerClient from '../src/glidertracker/client';

const WebSocket = require('ws');

const client = new GliderTrackerClient({ WebSocket });

function connect() {
  client.connect().then(() => {
    client.setView([3.22407, 48.49193, 9.9, 53.86296]);
    client.requestTrack('06DDA3B3', 1501244359000, Date.now());
  });
}

connect();

client.onClose = function() {
  console.log('Reconnecting...');
  connect();
};

client.onTrack = function(id, fixes) {
  for (let fix of fixes) {
    log(new Date(fix.time).toISOString(), id, fix.lon, fix.lat, fix.alt / 10 * 3);
  }
};

client.onRecord = function(record) {
  let data = record.data;

  if (data && data.extension) {
    log(data.timestamp, record.from.call, parseFloat(data.longitude), parseFloat(data.latitude),
      data.altitude, data.extension.speedMPerS * 3.6);
  }
};

function log(time: string, id: string, lon: number, lat: number, alt: number, speed?: number) {
  console.log(time, id, lon.toFixed(6), lat.toFixed(6),
    speed ? Math.round(speed) + 'km/h' : '??? km/h', Math.round(alt) + 'm');
}

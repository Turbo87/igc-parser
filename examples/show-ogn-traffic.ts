import * as fs from 'fs';

import OGNClient from '../src/ogn';

let senders = readCSV(`${__dirname}/../fixtures/2017-lev.csv`);

console.log('Connecting');
let client = new OGNClient(Object.keys(senders));

client.on('ready', () => {
  console.log('Connected');
});

client.on('record', (record: any) => {
  let sender = senders[record.from.call];
  let data = record.data;

  console.log(data.timestamp, sender.cn, data.longitude, data.latitude, Math.round(data.extension.speedMPerS) + 'km/h', Math.round(data.altitude) + 'm');
});

client.on('close', () => {
  console.log('Connection closed');
});

client.connect();

function readCSV(path: string) {
  let lines = fs.readFileSync(path, 'utf8').split('\n');
  lines.shift();

  let senders = Object.create(null);
  lines.map(line => line.trim().split(',')).forEach(([id, _, cn, type]) => {
    if (id) {
      senders[id] = { cn, type };
    }
  });
  return senders;
}

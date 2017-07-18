import * as fs from 'fs';

import OGNClient from '../src/ogn';

let senders = readCSV();

console.log('Connecting');
let client = new OGNClient(Object.keys(senders));

client.on('ready', () => {
  console.log('Connected');
});

client.on('record', (record: any) => {
  let sender = senders[record.from.call];

  console.log(sender.cn, record.data);
  console.log();
});

client.on('close', () => {
  console.log('Connection closed');
});

client.connect();

function readCSV() {
  let lines = fs.readFileSync(`${__dirname}/../fixtures/2017-lev.csv`, 'utf8').split('\n');
  lines.shift();

  let senders = Object.create(null);
  lines.map(line => line.trim().split(',')).forEach(([id, _, cn, type]) => {
    if (id) {
      senders[id] = { cn, type };
    }
  });
  return senders;
}

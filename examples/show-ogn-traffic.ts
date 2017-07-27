import OGNClient from '../src/ogn';
import {readCSV} from './utils/read-csv';

if (process.argv.length < 3) {
  console.log('Usage: ts-node examples/show-ogn-traffic.ts CSV_PATH');
  process.exit(1);
}

let senders = readCSV(process.argv[2]);

console.log('Connecting');
let client = new OGNClient(Object.keys(senders));

client.on('ready', () => {
  console.log('Connected');
});

client.on('record', (record: any) => {
  let sender = senders[record.from.call];
  let data = record.data;

  console.log(data.timestamp, sender.cn, data.longitude, data.latitude,
    Math.round(data.extension.speedMPerS * 3.6) + 'km/h', Math.round(data.altitude) + 'm');
});

client.on('close', () => {
  console.log('Connection closed');
});

client.connect();

import OGNClient from '../src/ogn';
import {readCSV} from "./utils/read-csv";

let senders = readCSV(`${__dirname}/../fixtures/2017-lev.csv`);

console.log('Connecting');
let client = new OGNClient(Object.keys(senders));

client.on('ready', () => {
  console.log('Connected');
});

client.on('record', (record: any) => {
  let sender = senders[record.from.call];
  let data = record.data;

  console.log(data.timestamp, sender.cn, data.longitude, data.latitude, Math.round(data.extension.speedMPerS * 3.6) + 'km/h', Math.round(data.altitude) + 'm');
});

client.on('close', () => {
  console.log('Connection closed');
});

client.connect();

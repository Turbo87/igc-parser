import * as fs from 'fs';

import OGNClient from '../src/ogn';
import {readCSV} from "./utils/read-csv";

let senders = readCSV(`${__dirname}/../fixtures/2017-lev.csv`);

console.log('Connecting');
let client = new OGNClient(Object.keys(senders));

client.on('ready', () => {
  console.log('Connected');
});

let buffer: string[] = [];
client.on('record', (record: any) => {
  buffer.push(`${Date.now()}|${record.raw}`);
  console.log(record.raw);
});

client.on('close', () => {
  console.log('Connection closed');
  client.connect();
});

client.connect();

scheduleSave();

function scheduleSave() {
  setTimeout(() => {
    saveToFile();
    scheduleSave();
  }, 5000);
}

function saveToFile() {
  console.log('Saving to ogn.log...');
  fs.appendFile('ogn.log', buffer.join('\n'));
  buffer = [];
}

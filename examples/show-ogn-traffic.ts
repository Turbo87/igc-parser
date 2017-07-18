import OGNClient from '../src/ogn';

console.log('Connecting');
let client = new OGNClient([
  '07EBC855',
  '07CEC858',
  '06DDFE29',
]);

client.on('ready', () => {
  console.log('Connected');
});

client.on('record', (record: any) => {
  console.log(record);
  console.log();
});

client.on('close', () => {
  console.log('Connection closed');
});

client.connect();

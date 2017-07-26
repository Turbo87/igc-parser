import * as fs from 'fs';

export function readCSV(path: string) {
  let lines = fs.readFileSync(path, 'utf8').split('\n');
  lines.shift();

  let senders = Object.create(null);
  lines.map(line => line.trim().split(',')).forEach(([id, _, cn, type]) => {
    if (id) {
      senders[id] = {cn, type};
    }
  });
  return senders;
}

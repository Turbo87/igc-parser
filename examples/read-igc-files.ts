import IGCParser, {IGCFile} from '../src/igc/parser';

import fs = require('fs');

if (process.argv.length < 3) {
  console.log('Usage: ts-node examples/read-igc-files.ts FOLDER');
  process.exit(1);
}

const SEPARATOR = `-----------------------------------------------------`;

let flightsPath = process.argv[2];
let filenames = fs.readdirSync(flightsPath).filter(filename => (/\.igc$/i).test(filename));

for (let filename of filenames) {
  let path = `${flightsPath}/${filename}`;
  let content = fs.readFileSync(path, 'utf8');
  let result = IGCParser.parse(content);

  print(filename, result);
}

if (filenames.length > 0) {
  console.log(SEPARATOR);
}

function print(filename: string, result: IGCFile) {
  console.log(SEPARATOR);
  console.log(`Filename:  ${filename}`);
  console.log(`Date:      ${result.date}`);
  console.log(`GPS fixes: ${result.fixes.length}`);
}

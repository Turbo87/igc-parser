import IGCParser, {IGCFile} from '../src/igc/parser';
import * as IGCFilenameParser from "../src/igc/filename-parser";

import fs = require('fs');

if (process.argv.length < 3) {
  console.log('Usage: ts-node examples/read-igc-files.ts FOLDER');
  process.exit(1);
}

const SEPARATOR = `-----------------------------------------------------`;

let flightsPath = process.argv[2];
let filenames = fs.readdirSync(flightsPath).filter(filename => (/\.igc$/i).test(filename));

for (let filename of filenames) {
  let filenameResult = IGCFilenameParser.parse(filename);

  let path = `${flightsPath}/${filename}`;
  let content = fs.readFileSync(path, 'utf8');
  let result = IGCParser.parse(content);

  print(filename, filenameResult, result);
}

if (filenames.length > 0) {
  console.log(SEPARATOR);
}

function print(filename: string, filenameResult: IGCFilenameParser.IGCFilenameData | null, result: IGCFile) {
  console.log(SEPARATOR);
  console.log();

  printLine('Filename', filename);
  console.log();

  if (filenameResult) {
    printLine('> Callsign', filenameResult.callsign);
    printLine('> Date', filenameResult.date);
    printLine('> Manufacturer', filenameResult.manufacturer);
    printLine('> Logger ID', filenameResult.loggerId);
    printLine('> Flight #', filenameResult.numFlight);
    console.log();
  }

  printLine('Date', result.date);
  printLine('GPS fixes', result.fixes.length);
  printLine('GPS times', `${result.fixes[0].time} - ${result.fixes[result.fixes.length - 1].time}`);

  console.log();
}

function printLine(title: string, value: any) {
  const MIN_TITLE_LENGTH = 18;

  title += ':';
  while (title.length < MIN_TITLE_LENGTH) {
    title += ' ';
  }

  if (value !== undefined && value !== null) {
    console.log(`${title}${value}`);
  }
}

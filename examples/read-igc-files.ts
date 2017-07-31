import * as IGCFilenameParser from '../src/igc/filename-parser';
import IGCParser, {ARecord, IGCFile} from '../src/igc/parser';

import fs = require('fs');

if (process.argv.length < 3) {
  console.log('Usage: ts-node examples/read-igc-files.ts FOLDER');
  process.exit(1);
}

const SEPARATOR = `-----------------------------------------------------`;

let flightsPath = process.argv[2];
let filenames = fs.readdirSync(flightsPath).filter(filename => (/\.igc$/i).test(filename));

for (let filename of filenames) {
  console.log(SEPARATOR);
  console.log();

  printLine('Filename', filename);
  console.log();

  let filenameData = IGCFilenameParser.parse(filename);
  if (filenameData) {
    printFilenameData(filenameData);
    console.log();
  }

  let path = `${flightsPath}/${filename}`;
  let content = fs.readFileSync(path, 'utf8');

  try {
    let data = IGCParser.parse(content);
    printData(data);
  } catch (error) {
    console.log(error);
  }

  console.log();
}

if (filenames.length > 0) {
  console.log(SEPARATOR);
}

function printFilenameData(data: IGCFilenameParser.IGCFilenameData) {
  printLine('> Callsign', data.callsign);
  printLine('> Date', data.date);
  printLine('> Manufacturer', data.manufacturer);
  printLine('> Logger ID', data.loggerId);
  printLine('> Flight #', data.numFlight);
}

function printData(data: IGCFile) {
  printARecord(data.aRecord);
  console.log();

  if (data.pilot || data.copilot) {
    printLine('Pilot', data.pilot);
    printLine('Copilot', data.copilot);
    console.log();
  }

  if (data.gliderType || data.registration || data.callsign || data.competitionClass || data.loggerType) {
    printLine('Registration', data.registration);
    printLine('Callsign', data.callsign);
    printLine('Glider Type', data.gliderType);
    printLine('Comp. Class', data.competitionClass);
    printLine('Logger Type', data.loggerType);
    console.log();
  }

  printLine('Date', data.date);

  printLine('GPS fixes', data.fixes.length);
  if (data.fixes.length !== 0) {
    printLine('GPS times', `${data.fixes[0].time} - ${data.fixes[data.fixes.length - 1].time}`);
  }

  let altitudes = data.fixes.map(it => it.gpsAltitude).filter(Boolean) as number[];
  if (altitudes.length !== 0) {
    printLine('Max. Altitude', Math.max(...altitudes) + 'm');
  }

  let enlValues = data.fixes.map(fix => fix.enl).filter(enl => enl !== null) as number[];
  if (enlValues.length !== 0) {
    let min = Math.min(...enlValues);
    let max = Math.max(...enlValues);
    printLine('ENL range', `${(min * 100).toFixed(1)} - ${(max * 100).toFixed(1)}%`);
  }
}

function printARecord(record: ARecord) {
  printLine('Manufacturer', record.manufacturer);
  printLine('Logger ID', record.loggerId);
  printLine('> Flight #', record.numFlight);
}

function printLine(title: string, value: any) {
  const MIN_TITLE_LENGTH = 18;

  title += ':';
  while (title.length < MIN_TITLE_LENGTH) {
    title += ' ';
  }

  if (value !== undefined && value !== null && value !== '') {
    console.log(`${title}${value}`);
  }
}

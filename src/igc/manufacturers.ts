const MANUFACTURERS = [
  { name: 'Aircotec', long: 'ACT', short: 'I' },
  { name: 'Cambridge Aero Instruments', long: 'CAM', short: 'C' },
  { name: 'ClearNav Instruments', long: 'CNI', short: null },
  { name: 'Data Swan/DSX', long: 'DSX', short: 'D' },
  { name: 'EW Avionics', long: 'EWA', short: 'E' },
  { name: 'Filser', long: 'FIL', short: 'F' },
  { name: 'Flarm', long: 'FLA', short: 'G' },
  { name: 'Flytech', long: 'FLY', short: null },
  { name: 'Garrecht', long: 'GCS', short: 'A' },
  { name: 'IMI Gliding Equipment', long: 'IMI', short: 'M' },
  { name: 'Logstream', long: 'LGS', short: null },
  { name: 'LX Navigation', long: 'LXN', short: 'L' },
  { name: 'LXNAV', long: 'LXV', short: 'V' },
  { name: 'Naviter', long: 'NAV', short: null },
  { name: 'New Technologies', long: 'NTE', short: 'N' },
  { name: 'Nielsen Kellerman', long: 'NKL', short: 'K' },
  { name: 'Peschges', long: 'PES', short: 'P' },
  { name: 'PressFinish Electronics', long: 'PFE', short: null },
  { name: 'Print Technik', long: 'PRT', short: 'R' },
  { name: 'Scheffel', long: 'SCH', short: 'H' },
  { name: 'Streamline Data Instruments', long: 'SDI', short: 'S' },
  { name: 'Triadis Engineering GmbH', long: 'TRI', short: 'T' },
  { name: 'Zander', long: 'ZAN', short: 'Z' },
];

export default MANUFACTURERS;

export function lookup(id: string, short = false): string {
  id = id.toUpperCase();

  let manufacturers = MANUFACTURERS.filter(it => it[short ? 'short' : 'long'] === id);
  return manufacturers.length !== 0 ? manufacturers[0].name : id;
}

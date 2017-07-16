const fs = require('fs');

function readFlight(path) {
  return fs.readFileSync(path, 'utf8')
    .split('\n')
    .filter(line => line[0] === 'B')
    .map(line => line.match(/^B(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{3})([NS])(\d{3})(\d{2})(\d{3})([EW])/))
    .filter(Boolean)
    .map(match => {
      let secOfDay = parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseInt(match[3]);
      let lat = parseInt(match[4]) + parseInt(match[5]) / 60 + parseInt(match[6]) / 60000;
      let lon = parseInt(match[8]) + parseInt(match[9]) / 60 + parseInt(match[10]) / 60000;
      let coordinate = [lon, lat];
      return { secOfDay, coordinate };
    });
}

module.exports = readFlight;

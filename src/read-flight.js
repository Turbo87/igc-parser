const fs = require('fs');

function readFlight(path) {
  return fs.readFileSync(path, 'utf8')
    .split('\n')
    .filter(line => line[0] === 'B')
    .map(line => line.match(/^B.{6}(\d{2})(\d{2})(\d{3})([NS])(\d{3})(\d{2})(\d{3})([EW])/))
    .filter(Boolean)
    .map(match => {
      let lat = parseInt(match[1]) + parseInt(match[2]) / 60 + parseInt(match[3]) / 60000;
      let lon = parseInt(match[5]) + parseInt(match[6]) / 60 + parseInt(match[7]) / 60000;
      return [lon, lat];
    });
}

module.exports = readFlight;

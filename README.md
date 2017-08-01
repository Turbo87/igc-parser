igc-parser
==============================================================================

[![Build Status](https://travis-ci.org/Turbo87/igc-parser.svg?branch=master)](https://travis-ci.org/Turbo87/igc-parser)

IGC flight log parser


Install
------------------------------------------------------------------------------

```bash
npm install --save igc-parser
```

or using [`yarn`](https://yarnpkg.com/):

```bash
yarn add igc-parser
```


Usage
------------------------------------------------------------------------------

```js
const fs = require('fs');
const IGCParser = require('igc-parser');

let result = IGCParser.parse(fs.readFileSync('1G_77fv6m71.igc', 'utf8'));
```

```js
{
  aRecord: {
    manufacturer: 'LXNAV',
    loggerId: '6M7',
    numFlight: 1,
    additionalData: null,
  },
  
  date: '2017-07-15',
  pilot: 'John Doe',
  copilot: null,
  gliderType: 'ASW 19',
  registration: 'D-2019',
  callsign: '1G',
  competitionClass: 'Club',
  loggerType: 'LXNAV,LX8080',
  
  fixes: [{
    enl: 0.04,
    extensions: Object {
      "ACZ": "100",
      "ENL": "040",
      "FXA": "060",
      "GSP": "00051",
      "OAT": "2400",
      "TAS": "00000",
      "TRT": "650",
      "VAT": "00010",
    },
    fixAccuracy: 60,
    gpsAltitude: 49,
    latitude: 51.0107,
    longitude: 7.010066666666667,
    pressureAltitude: -42,
    time: "10:18:26",
    timestamp: 1500113906000,
    valid: true,
  }, /* ... */],
}
```

For more examples have a look at our [test suite](test.ts).


License
------------------------------------------------------------------------------

igc-parser is licensed under the [MIT License](LICENSE).

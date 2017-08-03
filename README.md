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
var x = {
  date: '2017-07-15',
  numFlight: 1,
  
  pilot: 'John Doe',
  copilot: null,

  gliderType: 'ASW 19',
  registration: 'D-2019',
  callsign: '1G',
  competitionClass: 'Club',

  loggerId: '6M7',
  loggerManufacturer: 'LXNAV',
  loggerType: 'LXNAV,LX8080',
  
  task: {
    declarationDate: "2017-07-15",
    declarationTime: "08:57:20",
    declarationTimestamp: 1500109040000,

    flightDate: null,
    taskNumber: 2,

    numTurnpoints: 2,
    comment: "1000km",

    points: [
      {
        latitude: 0,
        longitude: 0,
        name: null,
      },
      {
        latitude: 51.14138333333333,
        longitude: 6.985283333333333,
        name: "006Langenfeld-Wiescheid",
      },
      // ...
    ],
  },

  fixes: [
    {
      enl: 0.04,
      extensions: {
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
    },
    // ...
  ],
  
  security: '60DC059E2D2F6CAD2E889224E355DBDDB805CAB100000639B49FC5F280A292C990F554789F12381380720000',
}
```

For more examples have a look at our [test suite](test.ts).


License
------------------------------------------------------------------------------

igc-parser is licensed under the [MIT License](LICENSE).

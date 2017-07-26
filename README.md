aeroscore
==============================================================================

[![Build Status](https://travis-ci.org/Turbo87/aeroscore.svg?branch=master)](https://travis-ci.org/Turbo87/aeroscore)

Gliding Competition Scoring


Content
------------------------------------------------------------------------------

The current status of the project is: **work in progress**

This project contains code and algorithms to score gliding competition
flights using the [TypeScript](https://www.typescriptlang.org/) programming
language. The reason for using TypeScript is being able to compile to
JavaScript and run the code in the browser to ultimately allow live scoring
using either [SkyLines](https://skylines.aero) or
[OGN](http://wiki.glidernet.org/) live tracking data.

The `examples` folder contains some basic scripts to demonstrate what the
library is currently capable of. It is recommended to run them using
[ts-node](https://github.com/TypeStrong/ts-node). For example:

```bash
ts-node examples/calc-ranking.ts fixtures/2017-07-17-lev.tsk fixtures/2017-07-17-lev
```


License
------------------------------------------------------------------------------

aeroscore is licensed under the [MIT License](LICENSE).

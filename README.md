# rsyncwrapper

An async wrapper to the rsync command line utility for Node.js

## Usage

    var rsync = require("rsyncwrapper").rsync;

    rsync(options,[callback]);

The callback gets three arguments `(error,stdout,stderr)`.

### Options

#### `src`

Blah de blah
# rsyncwrapper

An async wrapper to the rsync command line utility for Node.js

## Usage

    var rsync = require("rsyncwrapper").rsync;
    rsync(options,[callback]);

The callback gets three arguments `(error,stdout,stderr)`.

### Options

The `options` argument can have the following fields:

#### `src`

Required. The source file or directory to copy.

#### `dest`

Required. The destination file or directory to copy to.

#### `host`

A remote host if the copy operation needs to happen across ssh instead of the local filesystem. For example, `user@domain.com` or `user@1.2.3.4` etc.
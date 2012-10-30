## rsyncwrapper

An async wrapper to the rsync command line utility for Node.js.

### Prerequisites

A reasonably modern version of rsync (>=2.6.9) in your PATH.

### Installation

    npm install rsyncwrapper

### Usage

    var rsync = require("rsyncwrapper").rsync;
    rsync(options,[callback]);

The `callback` function gets three arguments `(error,stdout,stderr)`.

The `options` argument is an object literal with the following possible fields:

#### `src`

*[required string]* The source file or directory to copy. Path is relative to the Node app's folder, e.g. `./file.txt` or `/home/user/dir-to-copy/` etc.

#### `dest`

*[required string]* The destination file or directory to copy to. Path is relative to the Node app's folder, e.g. `./tmp/file.txt` or `/tmp` etc.

#### `host`

*[string]* Optional remote host string for the `dest`, e.g. `user@1.2.3.4` or `ssh-host-alias` etc.

#### `recursive`

*[boolean]* Boolean value specifying whether to copy directories and recurse through their contents. Without this option set to `true` rsync will only copy files.

#### `syncDest`

*[boolean]* Value specifying whether files that aren't in the `src` path should be deleted from the `dest` path. In otherwords whether rsync should syncronise the `dest` with the `src`. Take care with this option since it could cause data loss if misconfigured. Use in conjunction with the `dryRun` option initially.

#### `exclude`

*[array]* An array of exclude pattern strings to exclude from the copy operation. For example, `"*.txt"`, `"some-dir"`, `"some-dir/some-file.txt"` etc.

#### `compareMode`

*[string]* By default rsync will use an algorithm based on file size and modification date to determine if a file needs to be copied. Set the `compareMode` string to modify this behaviour. A value of `sizeOnly` will cause rsync to only check the size of the file to determine if it has changed and needs copying. A value of `checksum` will compare 128bit file checksums to see if copying is required and result in fairly heavy disk I/O on both sides.

For extra information and subtlety relating to these options please consult the [rsync manpages](http://linux.die.net/man/1/rsync).

#### `dryRun`

*[boolean]* Value specifying whether rsync should simply perform a dry run with the given options, i.e. not modify the file system put output verbose information to stdout about what actions it would have taken.


### Tests

Basic tests are run via [Vows Async BDD](http://vowsjs.org/) and [Grunt](http://gruntjs.com/). To test rsyncwrapper install it with the devDependancies and then run:

    npm test

### Examples

Copy a single file to another location. If the `dest` folder doesn't exist rsync will do a `mkdir` and create it. However it will only `mkdir` one missing directory deep (i.e. not the equivalent of `mkdir -p`).

```javascript
var rsync = require("rsyncwrapper").rsync;

rsync({
    src: "./file.txt",
    dest: "./tmp/file.txt"
},function (error,stdout,stderr) {
    if ( error ) {
        // failed
        console.log(error.message);
    } else {
        // success
    }
});
```

Copy the contents of a directory to another folder, while excluding `txt` files. Note the trailing `/` on the `src` folder and the absence of a trailing `/` on the `dest` folder - this is the required format when copy the contents of a folder. Again rsync will only `mkdir` one level deep:

var rsync = require("rsyncwrapper").rsync;

```javascript
rsync({
    src: "./src-folder/",
    dest: "./dest-folder",
    recursive: true,
    exclude: ["*.txt"]
},function (error,stdout,stderr) {
    if ( error ) {
        // failed
        console.log(error.message);
    } else {
        // success
    }
});
```

Syncronise the contents of a local directory with a directory on a remote host using the checksum algorithm to determine if a file needs copying:

```javascript
rsync({
    src: "./local-src/",
    dest: "/var/www/remote-dest",
    host: "user@1.2.3.4",
    recursive: true,
    delete: true,
    compareMode: "checksum"
},function (error,stdout,stderr) {
    if ( error ) {
        // failed
        console.log(error.message);
    } else {
        // success
    }
});
```

## TODO

- Add more tests to cover usage of more options.
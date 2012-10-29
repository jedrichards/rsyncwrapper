# rsyncwrapper

An async wrapper to the rsync command line utility for Node.js

## Prerequisites

A reasonably modern version of rsync (>=2.6.9) in your PATH.

## Installation

    npm install rsyncwrapper

## Usage

    var rsync = require("rsyncwrapper").rsync;
    rsync(options,[callback]);

The callback gets three arguments `(error,stdout,stderr)`.

### Options

The `options` argument can have the following fields:

#### `src`

*[required string]* The source file or directory to copy. Path is relative to the apps folder, e.g. `./file.txt` or `/home/user/dir-to-copy/` etc.

#### `dest`

*[required string]* The destination file or directory to copy to. Path is relative to the apps folder, e.g. `./tmp/file.txt` or `/tmp` etc.

#### `host`

*[string]* A remote host if the copy operation needs to happen across ssh instead of the local filesystem. For example, `user@domain.com` or `user@1.2.3.4` etc. Usage of this option requires passwordless-ssh via public/private keys to be working to your host.

#### `recursive`

*[boolean]* Boolean value specifying whether to recursively copy directories. Without this option set to `true` rsync will only copy files.

#### `delete`

*[boolean]* Boolean value specifying whether files that aren't in the `src` path should be deleted from the `dest` path. In  otherwords whether rsync should syncronise the `dest` with the `src`.

#### `exclude`

*[array]* An array of string to exclude from the operation. For example, `"*.txt"`, `"some-dir"`, `"some-dir/some-file.txt"` etc.

### `compareMode`

*[string]* By default rsync will use an algorithm based on file size and modification date to determine if a file needs to be copied. Set the `compareMode` string to modify this behaviour. A value of `sizeOnly` will cause rsync to only check the size of the file to determine if it has changed and needs copying. A value of `checksum` will compare 128bit file checksums to see if copying is required.

For extra information and subtlty relating to these options please consult the [rsync manpages](http://linux.die.net/man/1/rsync).

## Examples

Copying a single file to another location. If the destination folder doesn't exist rsync will `mkdir` it, it will only `mkdir` one missing directory deep though:

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

Copying the entire contents of a directory to another location, while exluding `txt` files. Note the trailing `/` on the `src` and the absence of a trailing `/` on the `dest`. Again rsync will only `mkdir` one level deep:

    var rsync = require("rsyncwrapper").rsync;
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
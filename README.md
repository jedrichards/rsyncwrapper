## rsyncwrapper

An async wrapper to the rsync command line utility for Node.js.

### Prerequisites

A reasonably modern version of rsync (>=2.6.9) in your PATH.

### Installation

    $ npm install rsyncwrapper

### Usage

```javascript
var rsync = require("rsyncwrapper").rsync;
rsync(options,[callback]);
```

The `callback` function gets four arguments `(error,stdout,stderr,cmd)`.

`error`: An `Error` object if rsync failed, otherwise `null`.

`stdout`: stdout from rsync.

`stderr`: stderr from rsync.

`cmd`: The command string that was used to invoke rsync for debugging purposes.

The `options` argument is an object literal with the following possible fields:

```javascript
{
    src: "some/path",           // Required string, path to file or dir to copy. src can also be
                                // an array of strings for copying multiple files, for example:
                                // ["./dir-a/file1","./dir-b/file2"]
    dest: "some/path",          // Required string, path to copy destination.
    host: "user@host",          // Optional string, remote host to prefix to dest if copying over
                                // ssh. Needs public/private key passwordless SSH access to your
                                // host to be working on your workstation.
    port: "1234",               // If your SSH host uses a non standard SSH port then set it here.
    recursive: true,            // Optional boolean, recursively copy dirs, sub-dirs and files. Only
                                // files in the root of src are copied unless this option is true.
    syncDest: true,             // Optional boolean, delete objects in dest that aren't present
                                // in src. Take care with this option, since misconfiguration
                                // could cause data loss. Maybe dryRun first?
    syncDestIgnoreExcl: true,   // Optional boolean, delete objects in dest that aren't present
                                // in src. Ignores excluded. Useful for such folders as 
                                // `node_modules`. Take care with this option, since misconfiguration
                                // could cause data loss. Maybe dryRun first?
    compareMode: "checksum",    // Optional string, adjust the way rsync determines if files need
                                // copying. By default rsync will check using file mod date and size.
                                // Set this option to "checksum" to use a 128bit checksum to check
                                // if a file has changed, or "sizeOnly" to only use a file's size.
    exclude: ["*.txt"],         // Optional array of rsync patterns to exclude from the operation.
    dryRun: false,              // Optional boolean, if true rsync will output verbose info to stdout
                                // about the actions it would take but does not modify the filesystem.
    args: ["--verbose"]         // Optional array of any additional rsync args you'd like to include.
}
```

The above options are provided for convenience and are designed to cover the most common use cases for rsync, they don't necessarily map directly to single rsync arguments with the same names. If you'd like to handcraft your rsync command then just use the `src`, `dest` and `args` options.

For extra information and subtlety relating to rsync options please consult the [rsync manpages](http://linux.die.net/man/1/rsync).

### Tests

Basic tests are run on [Vows Async BDD](http://vowsjs.org/) via this package's Gruntfile. To test rsyncwrapper clone the repo and ensure that the devDependancies are present. Additionally ensure that Grunt and Vows are installed globally, and then invoke:

    $ npm test

### Examples

Copy a single file to another location. If the `dest` folder doesn't exist rsync will do a `mkdir` and create it. However it will only `mkdir` one missing directory deep (i.e. not the equivalent of `mkdir -p`).

```javascript
rsync({
    src: "./file.txt",
    dest: "./tmp/file.txt"
},function (error,stdout,stderr,cmd) {
    if ( error ) {
        // failed
        console.log(error.message);
    } else {
        // success
    }
});
```

Copy the contents of a directory to another folder, while excluding `txt` files. Note the trailing `/` on the `src` folder and the absence of a trailing `/` on the `dest` folder - this is the required format when copy the contents of a folder. Again rsync will only `mkdir` one level deep:

```javascript
rsync({
    src: "./src-folder/",
    dest: "./dest-folder",
    recursive: true,
    exclude: ["*.txt"]
},function (error,stdout,stderr,cmd) {
    if ( error ) {
        // failed
        console.log(error.message);
    } else {
        // success
    }
});
```

Syncronise the contents of a directory on a remote host with the contents of a local directory using the checksum algorithm to determine if a file needs copying:

```javascript
rsync({
    src: "./local-src/",
    dest: "/var/www/remote-dest",
    host: "user@1.2.3.4",
    recursive: true,
    syncDest: true,
    compareMode: "checksum"
},function (error,stdout,stderr,cmd) {
    if ( error ) {
        // failed
        console.log(error.message);
    } else {
        // success
    }
});
```

## TODO

- Add tests to cover usage of more options.

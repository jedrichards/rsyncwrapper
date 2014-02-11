## rsyncwrapper

An async wrapper to the rsync command line utility for Node.js. Also available as the Grunt task [grunt-rsync](https://github.com/jedrichards/grunt-rsync).

### Release notes

- `0.1.0` Now using `child_process.exec` as opposed to `child_process.spawn` to enable proper shell wildcard expansions in the `options.src` value. SSH option handling has been improved.
- `0.0.1` Initial release.

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

The `options` argument is an object literal. See below for possible fields.

### Options

##### `src [String|Array<String>] *required`

Path to src. Can be a single filename, or an array of filenames. Shell wildcard expansion is supported. Examples:

```
src: "./dist/"
src: ["./dir-a/file1","./dir-b/file2"]
src: "./*.foo"
src: "foo{1,2,3}.txt"
etc.
```

##### `dest [String] *required`

Path to destination. Example, `"/var/www/mysite.tld"`.

##### `ssh [Bool] default: false`

Run rsync over ssh.  This is `false` by default.  To use this you need to have public/private key passwordless ssh access setup and working between your workstation and your host.  If set to `true`, you should specify ssh host data as part of your `src` or `dest` values, e.g. `user@1.2.3.4:/var/www/site`.

Another good approach is to define a host alias in your ssh config and just reference that alias in your rsync options.

##### `port [String]`

If your ssh host uses a non standard SSH port then set it here. Example, `"1234"`.

##### `privateKey [String]`

To specify an SSH private key other than the default for this host. Example, `"~/.ssh/aws.pem"`

##### `recursive [Boolean] default: false`

Recurse into directories. This is `false` by default which means only files in the `src` root are copied. Equivalent to the `--recursive` rsync command line flag.

##### `syncDest [Boolean] default: false`

Delete objects in `dest` that aren't present in `src`. Also deletes files that have been specifically excluded from transfer in `dest`. Take care with this option, since misconfiguration could cause data loss. Equivalent to setting both the `--delete` and `--delete-excluded` rsync command line flags.

##### `syncDestIgnoreExcl [Boolean] default: false`

The same as `syncDest`, but without the `--delete-excluded` behaviour. One use case for using this option could be while syncing a Node app to a server: you want to exclude transferring the local `node_modules` folder while retaining the remote `node_modules` folder.

##### `compareMode [String] enum: "checksum"|"sizeOnly"`

By default files will be compared by modified date and file size. Set this value to `checksum` to compare by a 128bit checksum, or `sizeOnly` to compare only by file size.

##### `exclude [Array<String>]`

Optional array of rsync patterns to exclude from transfer.

##### `include [Array<String>]`

Optional array of rsync patterns to include in the transfer, if previously excluded. Exclude patterns are defined before include patterns when building the rsync command.

##### `dryRun [Boolean] default: false`

Buffer verbose information to stdout about the actions rsyncwrapper would take without modifying the filesystem. Equivalent to setting both the `--dry-run` and `--verbose` rsync command line flags.

#### `onStdout [Function]`

Optional callback function. Called every time rsync outputs to `stdout`. Use this to print rsync output as it happens, rather than all at the end. Example: `function (data) { console.log(data) }`.

#### `onStderr [Function]`

Optional callback function. Called every time rsync outputs to `stderr`. Use this to print rsync error output as it happens, rather than all at the end. Example: `function (data) { console.log(data) }`.

##### `args [Array<String>]`

Array of additional arbitrary rsync command line options and flags.

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
    dest: "user@1.2.3.4:/var/www/remote-dest",
    ssh: true,
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

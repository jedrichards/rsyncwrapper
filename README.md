## rsyncwrapper

An async wrapper to the rsync command line utility for Node.js. Also available as the Grunt task [grunt-rsync](https://github.com/jedrichards/grunt-rsync).

### Release notes

- `0.4.3` Added the `excludeFirst` option. See [#34](https://github.com/jedrichards/rsyncwrapper/issues/34).
- `0.4.2` Add default `chmod` arguments on Windows to fix NTFS permissions, see [#28](https://github.com/jedrichards/rsyncwrapper/issues/28).
- `0.4.1` Renamed `syncDest` and `syncDestIgnoreExcl` options to the more scary sounding `deleteAll` and `delete` options in an effort to avoid potential user data loss due to misconfiguration. Updated docs to use the new option names. The old option names will continue to work.
- `0.4.0` Reworking the way stdin is passed from the process to the rsync child process to facilitate Windows clients being able to read a passphrase from stdin.
- `0.3.0` Swapping include/exclude order in the generated rsync command. Includes now come before excludes to faciliate the normal way of excluding file patterns with exceptions in rsync. See [#16](https://github.com/jedrichards/rsyncwrapper/pull/16).
- `0.2.0` Now launching the rsync command in a shell like `child_process.exec` [does in Node Core](https://github.com/joyent/node/blob/937e2e351b2450cf1e9c4d8b3e1a4e2a2def58bb/lib/child_process.js#L589). This enables us to use `spawn`, and avoid `exec` `maxBuffer`, while retaining full shell wildcard expansion.
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

##### :exclamation: `deleteAll [Boolean] default: false`

Take care with this option, since misconfiguration could cause data loss. Deletes objects in `dest` that aren't present in `src`, also deletes files in `dest` that have been specifically excluded from transfer. Equivalent to setting both the `--delete` and `--delete-excluded` rsync flags.

##### :exclamation: `delete [Boolean] default: false`

Take care with this option, since misconfiguration could cause data loss. The same as `deleteAll`, but without the `--delete-excluded` behaviour. One use case for using this option could be while syncing a Node app to a server: you want to exclude transferring the local `node_modules` folder while retaining the remote `node_modules` folder.

##### `compareMode [String] enum: "checksum"|"sizeOnly"`

By default files will be compared by modified date and file size. Set this value to `checksum` to compare by a 128bit checksum, or `sizeOnly` to compare only by file size.

##### `include [Array<String>]`

Optional array of rsync patterns to include in the transfer, if previously excluded. Include patterns are defined before exclude patterns when building the rsync command.

##### `exclude [Array<String>]`

Optional array of rsync patterns to exclude from transfer.  Include patterns are defined before exclude patterns when building the rsync command.

##### `excludeFirst [Array<String>]`

Optional array of rsync patterns to exclude from transfer. These are defined *before* the include patterns when building the rsync command. This is useful to exclude specific files or folders that would be included by the include patterns.

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
    src: "file.txt",
    dest: "tmp/file.txt"
},function (error,stdout,stderr,cmd) {
    if ( error ) {
        // failed
        console.log(error.message);
    } else {
        // success
    }
});
```

Copy the contents of a directory to another folder, while excluding `txt` files. Note the trailing `/` on the `src` folder and the absence of a trailing `/` on the `dest` folder - this is the required format when copying the contents of a folder. Again rsync will only `mkdir` one level deep:

```javascript
rsync({
    src: "src-folder/",
    dest: "dest-folder",
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

Syncronise the contents of a directory on a remote host with the contents of a local directory. The `deleteAll` option will delete all files on the remote host that either aren't present in the local folder or have been excluded from transfer.

```javascript
rsync({
    src: "local-src/",
    dest: "user@1.2.3.4:/var/www/remote-dest",
    ssh: true,
    recursive: true,
    deleteAll: true // Careful, this could cause data loss
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

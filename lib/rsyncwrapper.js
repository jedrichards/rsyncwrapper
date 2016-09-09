"use strict";

var spawn = require("child_process").spawn;
var util = require("util");
var _ = require("lodash");

var escapeSpaces = function(path) {
    if (typeof path === "string") {
        return path.replace(/\b\s/g, "\\ ");
    } else {
        return path;
    }
};

var escapeSpacesInOptions = function(options) {
    // Escape paths in the src, dest, include, exclude, and excludeFirst arguments
    ["src", "dest", "include", "exclude", "excludeFirst"].forEach(function(optionKey) {
        var option = options[optionKey];
        if (typeof option === "string") {
            options[optionKey] = escapeSpaces(option);
        } else if (Array.isArray(option) === true) {
            options[optionKey] = option.map(escapeSpaces);
        }
    });

    return options;
};

module.exports = function (options,callback) {

    options = options || {};
    options = util._extend({},options);
    options = escapeSpacesInOptions(options);

    var platform = options.platform || process.platform; // Enable process.platform to be mocked in options for testing
    var isWin = platform === "win32";

    if ( typeof options.src === "undefined" ) {
        throw(new Error("'src' directory is missing from options"));
    }

    if ( typeof options.dest === "undefined" ) {
        throw(new Error("'dest' directory is missing from options"));
    }

    var dest = options.dest;

    if ( typeof options.host !== "undefined" ) {
        dest = options.host+":"+options.dest;
    }

    if ( !Array.isArray(options.src) ) {
        options.src = [options.src];
    }

    var args = [].concat(options.src);

    args.push(dest);

    // [rsync failed on windows, copying persmissions](https://github.com/jedrichards/rsyncwrapper/issues/28)
    // [set chmod flag by default on Windows](https://github.com/jedrichards/rsyncwrapper/pull/29)
    var chmodArg = _.find(options.args, function (arg) { return arg.match(/--chmod=/); });
    if ( isWin && !chmodArg) {
        args.push("--chmod=ugo=rwX");
    }

    if (( typeof options.host !== "undefined" ) || ( options.ssh )) {
        args.push("--rsh");
        var rshCmd = "ssh";
        if ( typeof options.port !== "undefined" ) {
            rshCmd += " -p "+options.port;
        }
        if ( typeof options.privateKey !== "undefined" ) {
            rshCmd += " -i "+options.privateKey;
        }
        if ( typeof options.sshCmdArgs !== "undefined" ) {
            rshCmd += " "+options.sshCmdArgs.join(" ");
        }
        args.push(rshCmd);
    }

    if ( options.recursive === true ) {
        args.push("--recursive");
    }

    if ( options.times === true ) {
        args.push("--times");
    }

    if ( options.syncDest === true || options.deleteAll === true ) {
        args.push("--delete");
        args.push("--delete-excluded");
    }

    if ( options.syncDestIgnoreExcl === true || options.delete === true ) {
        args.push("--delete");
    }

    if ( options.dryRun === true ) {
        args.push("--dry-run");
        args.push("--verbose");
    }

    if ( typeof options.excludeFirst !== "undefined" && util.isArray(options.excludeFirst) ) {
        options.excludeFirst.forEach(function (value,index) {
            args.push("--exclude="+value);
        });
    }

    if ( typeof options.include !== "undefined" && util.isArray(options.include) ) {
        options.include.forEach(function (value,index) {
            args.push("--include="+value);
        });
    }

    if ( typeof options.exclude !== "undefined" && util.isArray(options.exclude) ) {
        options.exclude.forEach(function (value,index) {
            args.push("--exclude="+value);
        });
    }

    switch ( options.compareMode ) {
        case "sizeOnly":
            args.push("--size-only");
            break;
        case "checksum":
            args.push("--checksum");
            break;
    }

    if ( typeof options.args !== "undefined" && util.isArray(options.args) ) {
        args = _.union(args,options.args);
    }

    args = _.uniq(args);

    var noop = function () {};
    var onStdout = options.onStdout || noop;
    var onStderr = options.onStderr || noop;

    var cmd = "rsync ";
    args.forEach(function(arg) {
        if ( arg.substr(0,4) === "ssh ") {
            arg = '"'+arg+'"';
        }
        cmd += arg + " ";
    });
    cmd = cmd.trim();

    if ( options.noExec ) {
        callback(null,null,null,cmd);
        return;
    }

    try {
        var stdout = "";
        var stderr = "";
        // Launch cmd in a shell just like Node's child_process.exec() does:
        // see https://github.com/joyent/node/blob/937e2e351b2450cf1e9c4d8b3e1a4e2a2def58bb/lib/child_process.js#L589
        var child;
        if (isWin) {
            child = spawn(
              'cmd.exe',
              ['/s', '/c', '"' + cmd + '"'],
              {windowsVerbatimArguments:true, stdio: [process.stdin, 'pipe', 'pipe']}
            );
        } else {
            child = spawn('/bin/sh', ['-c', cmd]);
        }

        child.stdout.on("data",function (data) {
            onStdout(data);
            stdout += data;
        });

        child.stderr.on("data",function (data) {
            onStderr(data);
            stderr += data;
        });

        child.on("exit",function (code) {
            var err = null;
            if (code !== 0) {
                err = new Error("rsync exited with code " + code);
                err.code = code;
            }
            callback(err,stdout,stderr,cmd);
        });
    } catch (err) {
        callback(err,null,null,cmd);
    }
};

"use strict";

var spawn = require("child_process").spawn;
var exec = require("child_process").exec;
var util = require("util");
var _ = require("lodash");

exports.rsync = function (options,callback) {

    options = options || {};
    options = util._extend({},options);

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

    if (( typeof options.host !== "undefined" ) || ( options.ssh )) {
        args.push("--rsh");
        var rshCmd = "ssh";
        if ( typeof options.port !== "undefined" ) {
            rshCmd += " -p "+options.port;
        }
        if ( typeof options.privateKey !== "undefined" ) {
            rshCmd += " -i "+options.privateKey;
        }
        args.push(rshCmd);
    }

    if ( options.recursive === true ) {
        args.push("--recursive");
    }

    if ( options.syncDest === true ) {
        args.push("--delete");
        args.push("--delete-excluded");
    }

    if ( options.syncDestIgnoreExcl === true ) {
        args.push("--delete");
    }

    if ( options.dryRun === true ) {
        args.push("--dry-run");
        args.push("--verbose");
    }

    if ( typeof options.exclude !== "undefined" && util.isArray(options.exclude) ) {
        options.exclude.forEach(function (value,index) {
            args.push("--exclude="+value);
        });
    }

    if ( typeof options.include !== "undefined" && util.isArray(options.include) ) {
        options.include.forEach(function (value,index) {
            args.push("--include="+value);
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

    args = _.unique(args);

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
        var child = exec(cmd,{maxBuffer:1000*1024},noop);

        child.stdout.on("data",function (data) {
            onStdout(data);
            stdout += data;
        });

        child.stderr.on("data",function (data) {
            onStderr(data);
            stderr += data;
        });

        child.on("exit",function (code) {
            callback(code===0?null:new Error("rsync exited with code "+code),stdout,stderr,cmd);
        });
    } catch (err) {
        callback(err,null,null,cmd);
    }
};

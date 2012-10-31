"use strict";

var exec = require("child_process").exec;
var util = require("util");
var _ = require("lodash");

exports.rsync = function (options,callback) {

    options = options || {};

    if ( typeof options.src === "undefined" ) {
        throw(new Error("Source directory 'src' is missing from options"));
    }

    if ( typeof options.dest === "undefined" ) {
        throw(new Error("Destination directory 'dest' is missing from options"));
    }

    if ( typeof options.host !== "undefined" ) {
        options.dest = options.host+":"+options.dest;
    }

    var args = [options.src,options.dest];

    if ( typeof options.host !== "undefined" ) {
        args.push("--rsh=ssh");
    }

    if ( options.recursive === true ) {
        args.push("--recursive");
    }

    if ( options.syncDest === true ) {
        args.push("--delete");
        args.push("--delete-excluded");
    }

    if ( options.dryRun === true ) {
        args.push("--dry-run");
        args.push("--verbose");
        args.push("--stats");
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

    args = _.unique(args);

    var cmd = "rsync "+args.join(" ");

    try {
        exec(cmd,function (error,stdout,stderr) {
            callback(error,stdout,stderr,cmd);
        });
    } catch (error) {
        callback(error,null,null,cmd);
    }
};
"use strict";

var exec = require("child_process").exec;
var util = require("util");

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
        args.push("-r");
    }

    if ( options.delete === true ) {
        args.push("--delete");
    }

    if ( typeof options.exclude !== "undefined" && util.isArray(options.exclude)) {
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

    exec("rsync "+args.join(" "),function (error,stdout,stderr) {
        callback(error,stdout,stderr);
    });
};
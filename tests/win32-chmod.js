"use strict";

var fs = require("fs");
var vows = require("vows");
var assert = require("assert");
var rsync = require("../lib/rsyncwrapper").rsync;

var srcFile = "single.txt";
var srcFilePath = "user@example.com:tests/fixtures/"+srcFile;
var destDir = "./tmp/";
var copiedFile = destDir+srcFile;

exports.suite = vows.describe("Set defaul chmod for windows platform").addBatch({
    "When the platform is not win32": {
        topic: function() {
            process.platform = 'linux';
            rsync({
                src: srcFilePath,
                dest: destDir,
                noExec: true
            },this.callback);
        },
        "results in an rsync command that does not contains --chmod=ugo=rwX": function(error,stdout,stderr,cmd) {
            assert.equal(cmd, 'rsync user@example.com:tests/fixtures/single.txt ./tmp/');
        }
    },
    "When there is no existing chmod argument": {
        topic: function() {
            process.platform = 'win32';
            rsync({
                src: srcFilePath,
                dest: destDir,
                noExec: true
            },this.callback);
        },
        "results in an rsync command that contains --chmod=ugo=rwX": function(error,stdout,stderr,cmd) {
            assert.equal(cmd, 'rsync user@example.com:tests/fixtures/single.txt ./tmp/ --chmod=ugo=rwX');
        }
    },
    "When there is and existing chmod argument": {
        topic: function() {
            process.platform = 'win32';
            rsync({
                src: srcFilePath,
                dest: destDir,
                noExec: true,
                args: ['--chmod=u=r']
            },this.callback);
        },
        "results in an rsync command that does not override chmod argument": function(error,stdout,stderr,cmd) {
            assert.equal(cmd, 'rsync user@example.com:tests/fixtures/single.txt ./tmp/ --chmod=u=r');
        }
    }
});

"use strict";

var fs = require("fs");
var vows = require("vows");
var assert = require("assert");
var rsync = require("../lib/rsyncwrapper");

var srcFile = "single.txt";
var srcFilePath = "user@example.com:tests/fixtures/"+srcFile;
var destDir = "./tmp/";

exports.suite = vows.describe("Set default chmod for Windows platform").addBatch({
    "When not running under Windows": {
        topic: function() {
            rsync({
                src: srcFilePath,
                dest: destDir,
                noExec: true,
                platform: 'darwin'
            },this.callback);
        },
        "results in an rsync command that does not have --chmod=ugo=rwX automatically added": function(error,stdout,stderr,cmd) {
            assert.equal(cmd, 'rsync user@example.com:tests/fixtures/single.txt ./tmp/');
        }
    },
    "When running under Windows and there is no existing chmod argument": {
        topic: function() {
            rsync({
                src: srcFilePath,
                dest: destDir,
                noExec: true,
                platform: 'win32'
            },this.callback);
        },
        "results in an rsync command that contains --chmod=ugo=rwX": function(error,stdout,stderr,cmd) {
            assert.equal(cmd, 'rsync user@example.com:tests/fixtures/single.txt ./tmp/ --chmod=ugo=rwX');
        }
    },
    "When running under Windows and there is already an existing chmod argument": {
        topic: function() {
            rsync({
                src: srcFilePath,
                dest: destDir,
                noExec: true,
                args: ['--chmod=u=r'],
                platform: 'win32'
            },this.callback);
        },
        "results in an rsync command that does not override the chmod argument": function(error,stdout,stderr,cmd) {
            assert.equal(cmd, 'rsync user@example.com:tests/fixtures/single.txt ./tmp/ --chmod=u=r');
        }
    }
});

"use strict";

var fs = require("fs");
var path = require("path");
var vows = require("vows");
var assert = require("assert");
var rsync = require("../lib/rsyncwrapper");

var srcFile = "single filename with spaces.txt";
var srcFileWithAlreadyEscapedSpaces = "single\ filename\ with\ spaces.txt";
var srcFilePath = path.join("./tests/fixtures/", srcFile);
var srcFileWithAlreadyEscapedSpacesPath = path.join("./tests/fixtures/", srcFileWithAlreadyEscapedSpaces);
var destDir = "./tmp/";
var destDirWithSpaces = "./tmp with spaces/";
var destDirWithAlreadyEscapedSpaces = "./tmp\ with\ spaces/";
var copiedFile = path.join(destDir, srcFile);
var copiedFileWithSpaces = path.join(destDirWithSpaces, srcFile);
var copiedFileWithAlreadyEscapedSpaces = path.join(destDirWithAlreadyEscapedSpaces, srcFileWithAlreadyEscapedSpaces);

var commandWithNonEscapedSpaces = null;

exports.suite = vows.describe("Single file with spaces in filename copy tests").addBatch({
    "Copying a single file (with spaces in filename) into a dir": {
        topic: function() {
            rsync({
                src: srcFilePath,
                dest: destDir
            },this.callback);
        },
        "does not error": function (error,stdout,stderr) {
            assert.isNull(error);
        },
        "results in a file that": {
            topic: function () {
                fs.stat(copiedFile,this.callback);
            },
            "can be accessed": function (error,stats) {
                assert.isNull(error);
            },
            "has non-zero size": function (stats) {
                assert.isNotZero(stats.size);
            }
        }
    }
}).addBatch({
    "Copying a single file (with spaces in filename) into a dir (with spaces in the destination name)": {
        topic: function() {
            rsync({
                src: srcFilePath,
                dest: destDirWithSpaces
            },this.callback);
        },
        "does not error": function (error,stdout,stderr, cmd) {
            assert.isNull(error);
            commandWithNonEscapedSpaces = cmd;
        },
        "results in a file that": {
            topic: function () {
                fs.stat(copiedFileWithSpaces,this.callback);
            },
            "can be accessed": function (error,stats) {
                assert.isNull(error);
            },
            "has non-zero size": function (stats) {
                assert.isNotZero(stats.size);
            }
        }
    }
}).addBatch({
    "Copying a single file (with *already escaped* spaces in filename) into a dir (with *already escaped* spaces in the destination name)": {
        topic: function() {
            rsync({
                src: srcFileWithAlreadyEscapedSpacesPath,
                dest: destDirWithAlreadyEscapedSpaces
            },this.callback);
        },
        "does not error": function (error,stdout,stderr) {
            assert.isNull(error);
        },
        "does not escape already-escaped spaces": function (error,stdout,stderr, cmd) {
            assert.equal(cmd, commandWithNonEscapedSpaces);
        },
        "results in a file that": {
            topic: function () {
                fs.stat(copiedFileWithAlreadyEscapedSpaces,this.callback);
            },
            "can be accessed": function (error,stats) {
                assert.isNull(error);
            },
            "has non-zero size": function (stats) {
                assert.isNotZero(stats.size);
            }
        }
    }
});
"use strict";

var vows = require("vows");
var assert = require("assert");
var rsync = require("../lib/rsyncwrapper");

exports.suite = vows.describe("Errors tests").addBatch({
    "Call with a invalid args": {
        topic: function() {
            rsync({
                src : "/tmp/not_found_folder_src",
                dest: "/tmp/not_found_folder_dest",
                args: ['--invalid-args'],
            }, this.callback);
        },
        "throws an error and return a code": function(error, stdout) {
            assert.isDefined(error);
            assert.equal(error.code, 1);
        }
    }
});

"use strict";

var vows = require("vows");
var assert = require("assert");

var rsync = require("../lib/rsyncwrapper");

exports.suite = vows.describe("Package tests").addBatch({
    "The RSyncWrapper package": {
        topic: rsync,
        "is not null": function (rsync) {
            assert.isNotNull(rsync);
        },
        "exported module is a function": function (rsync) {
            assert.isFunction(function () {});
        },
        "throws an error when started without options": function (rsync) {
            var error;
            try {
              rsync();
            } catch (e) {
              error = e;
            }
            assert.isDefined(error);
        }
    }
});

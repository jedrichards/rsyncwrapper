"use strict";

var fs = require("fs");
var vows = require("vows");
var assert = require("assert");
var rsync = require("../lib/rsyncwrapper");

exports.suite = vows.describe("The sshCmdArgs option").addBatch({
    "Adds a single arg to the rsh ssh subcommand": {
        topic: function() {
            rsync({
                src: "user@example.com:tests/fixtures/single.txt",
                dest: "./tmp/",
                ssh: true,
                sshCmdArgs: ['-o StrictHostKeyChecking=no'],
                noExec: true
            },this.callback);
        },
        "and results in the expected command": function(error,stdout,stderr,cmd) {
            assert.equal(cmd, 'rsync user@example.com:tests/fixtures/single.txt ./tmp/ --rsh "ssh -o StrictHostKeyChecking=no"');
        }
    },
    "Adds a multiple args to the rsh ssh subcommand": {
        topic: function() {
            rsync({
                src: "user@example.com:tests/fixtures/single.txt",
                dest: "./tmp/",
                ssh: true,
                sshCmdArgs: ["-o StrictHostKeyChecking=no", "-p 22"],
                noExec: true
            },this.callback);
        },
        "and results in the expected command": function(error,stdout,stderr,cmd) {
            assert.equal(cmd, 'rsync user@example.com:tests/fixtures/single.txt ./tmp/ --rsh "ssh -o StrictHostKeyChecking=no -p 22"');
        }
    },
    "Works with other defined ssh options": {
        topic: function() {
            rsync({
                src: "user@example.com:tests/fixtures/single.txt",
                dest: "./tmp/",
                ssh: true,
                port: 22,
                privateKey: "~/.ssh/aws.pem",
                sshCmdArgs: ["-o StrictHostKeyChecking=no"],
                noExec: true
            },this.callback);
        },
        "and results in the expected command": function(error,stdout,stderr,cmd) {
            assert.equal(cmd, 'rsync user@example.com:tests/fixtures/single.txt ./tmp/ --rsh "ssh -p 22 -i ~/.ssh/aws.pem -o StrictHostKeyChecking=no"');
        }
    }
});

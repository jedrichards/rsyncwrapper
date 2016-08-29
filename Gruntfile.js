"use strict";

module.exports = function(grunt) {

    grunt.initConfig({
        jshint: {
            options: {
                "node": true,
                "globalstrict": true
            },
            files: {
                src: [
                    "grunt.js",
                    "vows/**/*.js",
                    "lib/**/*.js"
                ]
            }
        },
        shell: {
            tmpdir : {
                command: "mkdir tmp"
            },
            tmpdir_with_spaces: {
                command: "mkdir 'tmp with spaces'"
            }
        },
        clean: {
            tmp: ["tmp"],
            tmp_with_spaces: ["tmp with spaces"]
        },
        vows: {
            all: {
                src: [
                    "tests/package.js",
                    "tests/errors.js",
                    "tests/single-copy.js",
                    "tests/single-copy-with-escaped-spaces.js",
                    "tests/multi-copy.js",
                    "tests/src-as-array.js",
                    "tests/remote-host.js",
                    "tests/remote-dest.js",
                    "tests/remote-src.js",
                    "tests/win32-chmod.js",
                    "tests/ssh-cmd-args.js"
                ],
                options: {
                    reporter: "spec",
                    verbose: false,
                    silent: false,
                    colors: true
                }
            }
        }
    });

    grunt.loadNpmTasks("grunt-shell");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-vows");

    grunt.registerTask("test",["jshint","clean:tmp","shell:tmpdir","shell:tmpdir_with_spaces","vows","clean:tmp","clean:tmp_with_spaces"]);
};

"use strict";

module.exports = function(grunt) {

    grunt.initConfig({
        lint: {
            all: [
                "grunt.js",
                "vows/**/*.js",
                "lib/**/*.js"
            ]
        },
        jshint: {
            options: {
                "node": true,
                "es5": true,
                "globalstrict": true
            }
        },
        shell: {
            tmpdir : {
                command: "mkdir tmp"
            }
        },
        clean: {
            tmp: ["tmp"]
        },
        vows: {
            all: {
                files: ["tests/package.js","tests/single-copy.js","tests/multi-copy.js","tests/src-as-array.js"],
                reporter: "spec",
                verbose: false,
                silent: false,
                colors: true
            }
        }
    });

    grunt.loadNpmTasks("grunt-shell");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-vows");

    grunt.registerTask("test","lint clean:tmp shell:tmpdir vows clean:tmp");
};
module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        requirejs: {
          compile: {
            options: {
              name: "bootstrap",
              out: "public/js/twitifi.min.js",
              baseUrl: "public/js",
              paths: {
                text: "vendor/text",
                domReady: "vendor/require"
              },
              preserveLicenseComments: false
            }
          }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-requirejs');

    grunt.registerTask('default', ['requirejs']);
};
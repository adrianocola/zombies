module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jst: {
            options: {
                processContent: function(src) {
                    return src.replace(/(^\s+|\s+$|\n)/gm, '');
                }
            },
            compile: {
                files: {
                    "public/js/jst.js": ["public/partials/**/*.html"]
                }
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-jst');

    // Default task(s).
    grunt.registerTask('default', ['jst']);

};
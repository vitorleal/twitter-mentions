'use strict';

module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      files: ['gruntfile.js', 'public/**/*.js', 'routes/*.js', 'app.js'],

      options: {
        jshintrc: '.jshintrc',
        globals: {
          THREE:    true,
          console:  true,
          module:   true,
          document: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('default', ['jshint']);
};

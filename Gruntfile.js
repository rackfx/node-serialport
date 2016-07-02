'use strict';

var fs = require('fs');

module.exports = function(grunt) {
  grunt.initConfig({
    mochaTest: {
      test: {
        options: { reporter: 'spec' },
        src: ['test/*.js']
      }
    },
    eslint: {
      src: [
        '*.js',
        'lib/**/*.js',
        'test/**/*.js',
        'bin/**/*.js',
        'examples/**/*.js'
      ]
    },
    jsdoc2md: {
      options: {
        'template': fs.readFileSync('.README.hbs', 'utf8'),
        'global-index-format': 'table' // doesn't work!?
      },
      output: {
        src: 'lib/*.js',
        dest: 'README.md'
      },
    }
  });

  grunt.loadNpmTasks('grunt-jsdoc-to-markdown');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('gruntify-eslint');
  grunt.registerTask('lint', ['eslint']);
  grunt.registerTask('docs', ['jsdoc2md']);
  grunt.registerTask('test', ['mochaTest']);
  grunt.registerTask('default', ['lint', 'docs', 'test']);
};

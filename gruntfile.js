module.exports = function(grunt) {
  grunt.initConfig({
    sass: {
      dist: {
        files: {
          'build/stylesheets/style.css': 'assets/stylesheets/style.scss'
        }
      }
    },
    concat: {
      dist: {
        files: {
          'build/javascripts/script.js': 'assets/javascripts/**/*.js'
        }
      }
    },
    watch: {
      stylesheets: {
        files: ['assets/stylesheets/**/*.scss'],
        tasks: ['sass'],
      },
      javascripts: {
        files: ['assets/javascripts/**/*.js'],
        tasks: ['concat'],
      }
    }
  });

  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['sass']);
};

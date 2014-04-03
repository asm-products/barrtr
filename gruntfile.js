module.exports = function(grunt) {
  grunt.initConfig({
    sass: {
      dist: {
        files: {
          'public/stylesheets/style.css': 'assets/stylesheets/style.scss'
        }
      }
    },
    watch: {
      stylesheets: {
        files: ['assets/stylesheets/**/*.scss'],
        tasks: ['sass'],
      }
    }
  });

  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['sass']);
};

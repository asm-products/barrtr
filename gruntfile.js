module.exports = function(grunt) {
  grunt.initConfig({
    sass: {
      dist: {
        files: {
          'public/stylesheets/style.css': 'sass/style.scss'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-sass');

  grunt.registerTask('default', ['sass']);
};

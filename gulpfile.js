"use strict";

// Plugins
var            gulp = require( 'gulp' ),
            connect = require( 'connect' ),
  connectLivereload = require( 'connect-livereload' ),
     gulpLivereload = require( 'gulp-livereload' ),
               sass = require( 'gulp-sass' ),
             prefix = require( 'gulp-autoprefixer' ),
             jshint = require( "gulp-jshint" ),
            stylish = require( 'jshint-stylish' ),
            rimraf = require( 'rimraf' ),
            gulpSequence = require('gulp-sequence'),
            fileinclude = require('gulp-file-include');

// paths & files
var path = {
        src: 'src/',
        html: 'src/**/*.html',
        destHtml: 'dist/**/*.html',
        js: 'src/js/**/*.js',
        destJs: 'dist/js/',
        sass: 'src/sass/**/*.scss',
        css: 'src/css/',
        destCss: 'dist/css/',
        img: 'src/img/**/*.*',
        destImg: 'dist/img/',
        dest: 'dist/',
};

// ports
var localPort =  4000,
       lrPort = 35729;

// start local server
gulp.task( 'server', function() {
  var server = connect();

  server.use( connectLivereload( { port: lrPort } ) );
  server.use( connect.static( path.dest ) );
  server.listen( localPort );

  console.log( "\nlocal server running at http://localhost:" + localPort + "/\n" );
});

// jshint
gulp.task( 'jshint', function() {
  gulp.src( path.js )
    .pipe( jshint() )
    .pipe( jshint.reporter( stylish ) );
});



// watch file
gulp.task( 'watch', function(done) {
  var lrServer = gulpLivereload();

  gulp.watch( [path.destHtml, path.destJs, path.distCss + '/**/*.css' ] )
    .on( 'change', function( file ) {
      lrServer.changed( file.path );
    });

  gulp.watch( path.js, ['jshint'] );
  gulp.watch( path.js, ['js'] );
  gulp.watch( path.html, ['html'] );
  gulp.watch( path.sass, ['sass'] );
});

gulp.task('img', function(){
  gulp.src([path.img])
  .pipe(gulp.dest(path.destImg));
});

gulp.task('html', function(){
  return gulp.src([path.html])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest(path.dest));
});


gulp.task('js', function() {
  gulp.src([path.js])
  .pipe(gulp.dest(path.destJs));
});


gulp.task('clean', function(cb){
  rimraf('./dist', cb);
});

// compile sass
gulp.task( 'sass', function() {
  gulp.src( path.sass )
    .pipe( sass({
      outputStyle: [ 'expanded' ],
      sourceComments: 'normal',
      errLogToConsole: true
    }))
    .pipe( prefix() )
    .pipe( gulp.dest( path.destCss ) );
});

// default task
gulp.task( 'default', function(cb){
  gulpSequence(['clean'], ['img'],  ['js', 'sass'], ['html'], ['server', 'watch'] )(cb);
});
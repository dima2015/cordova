var gulp = require('gulp');
var sass = require('gulp-sass');
var sync = require('browser-sync');
var concat = require('gulp-concat');
var clean = require('gulp-clean');
var gulp  = require('gulp')
var shell = require('gulp-shell')
//var connect = require('gulp-connect');


gulp.task('sass_compile_org', function () {
    return gulp.src('www/assets/sass/components/organization/organization.sass', {style: 'expanded'})
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('www/assets/css/generated'))
});
gulp.task('sass_compile_user', function () {
    return gulp.src('www/assets/sass/components/user/user.sass', {style: 'expanded'})
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('www/assets/css/generated'))
});
gulp.task('sass_compile_global', function () {
    return gulp.src('www/assets/sass/global/global.sass', {style: 'expanded'})
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('www/assets/css/generated'))
});
gulp.task('sass_compile_presentation', function(){
    return gulp.src('www/assets/sass/components/presentation/*.sass', {style: 'expanded'})
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('www/assets/css/generated'))
});
gulp.task('sass_compile', ['sass_compile_global','sass_compile_user', 'sass_compile_org','sass_compile_presentation']);
gulp.task('copy_node_modules', function(){
    return gulp.src('node_modules/**')
        .pipe(gulp.dest('www/node_modules/'));
});

gulp.task('broswer-sync', function () {
    sync.init(["www/assets/css/generated/*.css",
        "www/app/*/*/*/*.html",
        "www/*.html",
        "www/app/*/*/*.html",
        "www/app/dist/*.js"], {
        server: {
            baseDir: "./www"
        }
    });
});
gulp.task('watch', function () {
    gulp.watch('www/assets/sass/**/*.sass', ['sass_compile']);
    gulp.watch('www/app/*/*/*/*.js', ['concat']);
    gulp.watch('www/app/configuration/*.js', ['concat']);
    gulp.watch('www/app/*/*/*.js',['concat']);
});
gulp.task('concat_presentation', function(){
    return gulp.src('www/app/components/presentation/*.js')
        .pipe(concat('controllers_presentation.js'))
        .pipe(gulp.dest('www/app/dist'));
});
gulp.task('concat_controllers_user', function () {
    return gulp.src('www/app/components/user/*/*.js')
        .pipe(concat('controllers_user.js'))
        .pipe(gulp.dest('www/app/dist'));
});
gulp.task('concat_controllers_organization', function () {
    return gulp.src('www/app/components/organization/*/*.js')
        .pipe(concat('controllers_org.js'))
        .pipe(gulp.dest('www/app/dist'));
});
gulp.task('concat_services_directives', function () {
    return gulp.src('www/app/shared/*/*.js')
        .pipe(concat('services_directives.js'))
        .pipe(gulp.dest('www/app/dist'));
});
gulp.task('concat_configuration', function () {
    return gulp.src('www/app/configuration/*.js')
        .pipe(concat('angular_app_config.js'))
        .pipe(gulp.dest('www/app/dist'));
});


gulp.task('gz-remove', ['production'],  function (){
    return gulp.src('www/node_modules/**/*.gz')
        .pipe(clean());
});

gulp.task('key-remove', ['production'],  function (){
    return gulp.src('www/node_modules/**/*.key')
        .pipe(clean());
});

gulp.task('concat', ['concat_configuration', 'concat_services_directives', 'concat_controllers_organization', 'concat_controllers_user', 'concat_presentation']);


gulp.task('production', ['sass_compile','concat', 'copy_node_modules']);

gulp.task('android-prepare', ['production', 'gz-remove', 'key-remove']);

gulp.task('run', shell.task([
    'cordova run android'
]));

gulp.task('release', shell.task([
    'cordova build android --release'
]));

gulp.task('android-execute', ['android-prepare', 'run']);


gulp.task('dev', ['watch', 'broswer-sync', 'sass_compile', 'concat']);

gulp.task('default', ['watch', 'broswer-sync', 'sass_compile'], function () {

});

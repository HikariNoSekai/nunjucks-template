'use strict';

const gulp = require('gulp');
const postcss = require('gulp-postcss');
const nested = require('postcss-nested');
const simpleVars = require('postcss-simple-vars');
const atImport = require("postcss-import");
const csso = require('postcss-csso');
const precss = require('precss');
const cssnext = require('postcss-cssnext');
const short = require('postcss-short');
const mixins = require('postcss-mixins');
const uglify = require('gulp-uglify');
const babelify = require('babelify');
const browserify = require('gulp-browserify');
const maps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const browserSync = require('browser-sync');
const nunjucks = require('gulp-nunjucks-render');
const imagemin = require('gulp-imagemin');
const watch = require('gulp-watch');
const plumber = require('gulp-plumber');

gulp.task('css', function() {
    let processors = [
        precss,
        atImport,
        cssnext,
        short,
        csso,
        mixins,
        nested,
        simpleVars,
    ];
    return gulp.src('src/assets/main.css')
        .pipe(plumber())
        .pipe(maps.init())
        .pipe(postcss(processors))
        .pipe(rename({
            extname: '.css',
            suffix: '.min'
        }))
        .pipe(maps.write('./'))
        .pipe(plumber.stop())
        .pipe(gulp.dest('dist/style'))
        .pipe(browserSync.stream())
});

gulp.task('html', function() {
    return gulp.src('src/layout/*.html')
        .pipe(plumber())
        .pipe(nunjucks({
            path: 'src/'
        }))
        .pipe(plumber.stop())
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.stream())
});

gulp.task('js', function() {
    return gulp.src('src/js/main.js')
        .pipe(plumber())
        .pipe(maps.init())
        .pipe(browserify({
            debug: true,
            transform: [babelify.configure({
                presets: ['env']
            })]
        }))
        .pipe(uglify())
        .pipe(rename({
            extname: '.js',
            suffix: '.min'
        }))
        .pipe(maps.write('./'))
        .pipe(plumber.stop())
        .pipe(gulp.dest('./dist/js'))
        .pipe(browserSync.stream())
});

gulp.task('img', function() {
    return gulp.src('src/img/**/*.*')
        .pipe(imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.jpegtran({ progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.svgo({
                plugins: [
                    { removeViewBox: true },
                    { cleanupIDs: false }
                ]
            })
        ]))
        .pipe(gulp.dest('dist/img'))
});

gulp.task('reload', function() {
    browserSync({
        server: {
            baseDir: 'dist/'
        },
        notify: false
    });
});

gulp.task('fonts', function() {
    return gulp.src('src/fonts/*.*')
        .pipe(gulp.dest('dist/fonts'))
})

gulp.task('watch', ['reload', 'js', 'css', 'html', 'img', 'fonts'], function() {
    watch('src/**/*.html', () => gulp.start('html'));
    watch('src/**/*.css', () => gulp.start('css'));
    watch('src/**/*.js', () => gulp.start('js'));
    gulp.watch('dist/*.html', browserSync.reload());
});
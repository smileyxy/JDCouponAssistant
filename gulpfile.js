const gulp = require('gulp'),
    browserify = require("browserify"),
    source = require("vinyl-source-stream"),
    tsify = require("tsify"),
    uglify = require('gulp-uglify'),
    babel = require("gulp-babel"),
    buffer = require('vinyl-buffer'),
    obfuscate = require('gulp-javascript-obfuscator');

gulp.task("default", () => {
    return browserify({
        basedir: ".",
        debug: false,
        entries: ['./main.ts'],
        cache: {},
        packageCache: {}
    })
        .plugin(tsify)
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(babel({//编译ES6
            presets: ['es2015']
            ,compact: false
        }))
        //.pipe(uglify({ mangle: { toplevel: true } }))
        .pipe(uglify())
        .pipe(obfuscate())
        .pipe(gulp.dest('dist'))
});
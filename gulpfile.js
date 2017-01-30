
"use strict";

const gulp = require("gulp");
const $ = require("gulp-load-plugins")();

const pump = require("pump");

const tsProject = $.typescript.createProject("./tsconfig.json");

function ts(cb) {
  pump([
    gulp.src('./src/**/*.ts'),
    $.sourcemaps.init(),
    tsProject(),
    $.sourcemaps.write(),
    gulp.dest('./dist/')
  ], cb);
}


function watch() {
  gulp.watch('./**/*.ts', ts);
}

gulp.task('ts', ts);
gulp.task('watch', watch);

gulp.task('default', ts);

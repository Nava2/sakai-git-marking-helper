
"use strict";

const gulp = require("gulp");
const _ = require("lodash");
const $ = require("gulp-load-plugins")();

const pump = require("pump");

const tsProject = $.typescript.createProject("./tsconfig.json");

function ts(cb) {
  pump([
    gulp.src('./src/**/*.ts'),
    tsProject(),
    gulp.dest('./dist')
  ], cb);
}


function watch() {
  gulp.watch('src/**/*.ts', ts);
}

gulp.task('ts', ts);
gulp.task('watch', watch);

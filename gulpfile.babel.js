"use strict";
import gulp from "gulp";
import babel from "gulp-babel";
import concat from "gulp-concat";
import uglify from "gulp-uglify";
import browserify from "browserify";
import babelify from "babelify";
import source from "vinyl-source-stream";
import buffer from "vinyl-buffer";
process.env.FORCE_COLOR = true;
gulp.task("js", () => {
	return gulp.src("src/*")
		/*
	return browserify({
		entries: "",
		debug: true
	})
		.transform(babelify, {
			stage: 0
		}).bundle()*/
		.pipe(babel({
			stage: 0,
			modules: "system"
		}))
// 		.pipe(source("bundle.js"))
		.pipe(buffer())
// 		.pipe(concat("websocket-promise.min.js"))
		.pipe(uglify({
			mangle: true
		}))
		.pipe(gulp.dest("dist"));
});
gulp.task("default", () => {
	gulp.start(["js"]);
});
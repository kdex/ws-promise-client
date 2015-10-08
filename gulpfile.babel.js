"use strict";
import gulp from "gulp";
import babel from "gulp-babel";
import concat from "gulp-concat";
import uglify from "gulp-uglify";
import source from "vinyl-source-stream";
import buffer from "vinyl-buffer";
process.env.FORCE_COLOR = true;
gulp.task("js", () => {
	return gulp.src("src/*")
		.pipe(babel({
			stage: 0,
			modules: "system"
		}))
		.pipe(buffer())
		.pipe(uglify({
			mangle: true
		}))
		.pipe(gulp.dest("dist"));
});
gulp.task("default", () => {
	gulp.start(["js"]);
});
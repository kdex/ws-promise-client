"use strict";
import gulp from "gulp";
import babel from "gulp-babel";
import concat from "gulp-concat";
import uglify from "gulp-uglify";
import source from "vinyl-source-stream";
import buffer from "vinyl-buffer";
import merge from "merge2";
process.env.FORCE_COLOR = true;
gulp.task("js", () => {
	let streams = [];
	for (let moduleType of ["amdStrict", "commonStrict", "system", "umdStrict"]) {
		streams.push(gulp.src("src/*")
			.pipe(babel({
				stage: 0,
				modules: moduleType
			}))
			.pipe(buffer())
			.pipe(uglify({
				mangle: true
			}))
			.pipe(gulp.dest(`dist/${moduleType.replace("Strict", "")}`)));
	}
	return merge(streams);
});
gulp.task("default", () => {
	gulp.start(["js"]);
});
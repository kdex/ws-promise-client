import ava from "gulp-ava";
import babel from "gulp-babel";
import gulp from "gulp";
import uglify from "gulp-uglify";
gulp.task("js", () => {
	return gulp.src("src/**/*.js")
		.pipe(babel())
		.pipe(uglify({
			mangle: true
		}))
		.pipe(gulp.dest("dist"));
});
gulp.task("test", () => {
	return gulp.src("tests/**/*.js")
		.pipe(ava({
			verbose: true
		}));
});
gulp.task("default", gulp.parallel("js"));
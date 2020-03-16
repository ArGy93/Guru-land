var gulp 				= require('gulp'); // Connect Gulp
var browserSync = require('browser-sync'); // Connect browser synchronization
var del					= require('del'); // Connect to delete dist
var stylus			= require('gulp-stylus'); // Connect stylus
var concat			= require('gulp-concat'); // Connect for concatenation .styl
var cssnano			= require('gulp-cssnano'); // Connect minification css
var rename			= require('gulp-rename'); // Connect rename css (.min)
var prefixer		= require('gulp-autoprefixer'); // Connect prefixes to .css
var imagemin		= require('gulp-imagemin'); // Connect to resizing images
var pngquant		= require('imagemin-pngquant'); // Connect to resizing .png
var cache				= require('gulp-cache'); // Connect cache for img

// For synchronization browser with code
gulp.task('server', function() {
  browserSync({
    server: {
      baseDir: 'src'
    }
  })
});

// For recompile dist folder
gulp.task('clean', function () {
	return del.sync('dist/');
});

// For clearing cache
gulp.task('clear', function () {
	return cache.clearAll();
});

// For add frameworks and plugins to project
gulp.task('add-libs', function () {
	var normalizyCss = gulp.src('node_modules/normalize.css/normalize.css')
										 .pipe(gulp.dest('src/libs/normalizeCss/'))
});

// For compilation stylus-file to css-file
gulp.task('styl', function () {
	return gulp.src([
          'src/stylus/main.styl',
          'src/stylus/header.styl',
          'src/stylus/main_section.styl',
          'src/stylus/scoring-sdk_section.styl',
          'src/stylus/benefits-sdk_section.styl',
          'src/stylus/stages_section.styl',
          'src/stylus/platform_section.styl',
          'src/stylus/numbers_section.styl',
          'src/stylus/exchange_section.styl',
          'src/stylus/calculator_section.styl',
          'src/stylus/media.styl',
        ])
				.pipe(concat('style.styl'))
				.pipe(stylus())
				.pipe(prefixer({
					browsers: [
						'last 10 versions',
						'> 1%',
						'ie 11',
						'iOS 10'
					],
					cascade: true
				}))
				.pipe(gulp.dest('src/css/'))
				.pipe(browserSync.reload({
					stream: true
				}))
});

// For minimizing styles
gulp.task('css-min', function () {
	return gulp.src('src/css/style.css')
				.pipe(cssnano())
				.pipe(rename({
					suffix: '.min'
				}))
				.pipe(gulp.dest('dist/css/'))
});

//  For minimizing img and cache them
gulp.task('img', function () {
	return gulp.src('src/img/**/*')
				.pipe(cache
					(imagemin([
						imagemin.gifsicle({interlaced: true}),
						imagemin.jpegtran({progressive: true}),
						imagemin.optipng({optimizationLevel: 5}),
						imagemin.svgo({
							plugins: [
								{removeViewBox: true},
								{cleanupIDs: false}
							]
						}),
						imagemin(['images/*.png'], 'build/images', {
							use: [pngquant()]
						})
					]))
				)
				.pipe(browserSync.reload({
            stream: true
        }))
				.pipe(gulp.dest('dist/img/'))
});



gulp.task('watch', ['server', 'add-libs', 'styl'], function () {
	gulp.watch('src/stylus/**/*.styl', ['styl']);
	gulp.watch('src/**/*.html', browserSync.reload);
});

gulp.task('build', ['clean', 'add-libs', 'img', 'styl', 'css-min'],
	function () {

	var prodFonts = gulp.src('src/fonts/**/*')
									.pipe(gulp.dest('dist/fonts/'));

	var prodLibs = gulp.src('src/libs/**/*')
								 .pipe(gulp.dest('dist/libs'))

	var prodCss = gulp.src('src/css/**/*.css')
								.pipe(gulp.dest('dist/css/'));

	var prodHtml = gulp.src('src/**/*.html')
								.pipe(gulp.dest('dist/'))

});

gulp.task('default', ['watch', 'build']);

// ディレクトリ
var path = {
    // 'distRootPath': 'htdocs', // 公開rootディレクトリ
    'destRootPath': '', // 開発用rootディレクトリ
    'destImagePath': 'dist/img', // 開発用画像格納ディレクトリ
    'destCssPath': 'dist/css', // 開発用css格納ディレクトリ
    'destJsPath': 'dist/js', // 開発用js格納ディレクトリ
    'sassPath': 'src/sass', // 作業領域sass格納ディレクトリ
    'imagePath': 'src/img', // 作業領域画像格納ディレクトリ
    'cssPath': 'src/css', // 作業領域css格納ディレクトリ
    'jsPath': 'src/js' // 作業領域js格納ディレクトリ
}

// 使用パッケージ
var gulp = require('gulp');
var del = require('del');
var rename = require('gulp-rename');
var ejs = require('gulp-ejs');
var htmlbeautify = require('gulp-html-beautify');
var sass = require('gulp-sass');
var pleeease = require('gulp-pleeease');
var sourcemaps = require('gulp-sourcemaps');
var changed = require('gulp-changed');
//画像圧縮
var imagemin = require('gulp-imagemin');
var imageminJpg = require('imagemin-jpeg-recompress');
var imageminPng = require('imagemin-pngquant');
var imageminGif = require('imagemin-gifsicle');
var svgmin = require('gulp-svgmin');
//js結合・圧縮
var uglify = require('gulp-uglify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
// コンパイルエラーが出てもwatchを止めない
var plumber = require('gulp-plumber');

// 不要ファイル削除
gulp.task('clean', ['copy'], function() {
    del([
        path.distRootPath + '/**/.DS_Store',
        path.distRootPath + '/**/Thumbs.db',
        path.distRootPath + '/**/*.map'
    ]);
});

// ファイルコピー
gulp.task('cleandist', function() {
    del([
        path.distRootPath + '/**/*'
    ]);
});
gulp.task('copy', ['cleandist'], function() {
    return gulp.src(path.destRootPath + '/**/*')
        .pipe(gulp.dest(path.distRootPath + '/'))
});

// 開発→公開ファイル移動
gulp.task('updist', ['clean']);

// jpg,png,gif画像の圧縮タスク
gulp.task('imagemin', function() {
    var srcGlob = path.imagePath + '/**/*.+(jpg|jpeg|png|gif)';
    var dstGlob = path.destImagePath;
    gulp.src(srcGlob)
        .pipe(changed(dstGlob))
        .pipe(imagemin([
            imageminPng(),
            imageminJpg(),
            imageminGif({
                interlaced: false,
                optimizationLevel: 3,
                colors: 180
            })
        ]))
        .pipe(gulp.dest(dstGlob));
});
// svg画像の圧縮タスク
gulp.task('svgmin', function() {
    var srcGlob = path.imagePath + '/**/*.+(svg)';
    var dstGlob = path.destImagePath;
    gulp.src(srcGlob)
        .pipe(changed(dstGlob))
        .pipe(svgmin())
        .pipe(gulp.dest(dstGlob));
});

// sass
gulp.task('sass', function() {
    gulp.src(path.sassPath + '/**/*.scss')
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'expanded'
        }))
        .pipe(pleeease({
            autoprefixer: { 'browsers': ['> 1%', 'last 2 versions', 'Firefox ESR'] },
            minifier: false,
            mqpacker: true,
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(path.destCssPath + '/'))
});

//js結合
gulp.task('browserify', () => {
    return browserify({
            entries: ['./src/js/app.js']
        })
        .bundle()
        .pipe(source('app.js'))
        .pipe(gulp.dest(path.destJsPath + '/'))
});

// js圧縮
gulp.task('compress', () => {
    return gulp.src(path.jsPath + '/**/*.js')
        .pipe(uglify())
        .pipe(gulp.dest(path.destJsPath + '/'))
});

// ファイル変更監視
gulp.task('watch', function() {
    gulp.watch(path.sassPath + '/**/*.scss', function(event) {
        gulp.run(['sass'])
    });
    // gulp.watch(path.sassPathLp + '/**/*.scss', function(event){
    //   gulp.run('sassLp')
    // });
    gulp.watch(path.jsPath + '/**/*.js', function(event) {
        gulp.run(['browserify', 'compress'])
    });
    gulp.watch(path.imagePath + '/**/*', ['imagemin', 'svgmin']);
});

// タスク実行
gulp.task('default', ['watch']); // デフォルト実行
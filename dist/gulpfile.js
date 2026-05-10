const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const javascriptObfuscator = require('gulp-javascript-obfuscator');
const rename = require('gulp-rename');
const del = require('del');

// Limpar pasta dist antes de cada build
gulp.task('clean', function() {
  return del(['dist/**', '!dist']);
});

// Minificar HTML
gulp.task('html', function() {
  return gulp.src('src/**/*.html')
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true,
      minifyJS: true,
      minifyCSS: true,
      removeAttributeQuotes: true
    }))
    .pipe(gulp.dest('dist'));
});

// Minificar CSS
gulp.task('css', function() {
  return gulp.src('src/css/**/*.css')
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('dist/css'));
});

// Ofuscar + Minificar JS
gulp.task('js', function() {
  return gulp.src('src/js/**/*.js')
    .pipe(javascriptObfuscator({
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 0.75,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 0.4,
      debugProtection: true,
      debugProtectionInterval: 2000,
      disableConsoleOutput: true,
      identifierNamesGenerator: 'hexadecimal',
      stringArray: true,
      stringArrayEncoding: ['base64'],
      stringArrayThreshold: 0.75,
      transformObjectKeys: true
    }))
    .pipe(uglify())
    .pipe(rename({ suffix: '.obf' }))
    .pipe(gulp.dest('dist/js'));
});

// Copiar arquivos estáticos (imagens, ícones, etc.)
gulp.task('assets', function() {
  return gulp.src(['src/**/*.{png,svg,ico,webp,jpg,jpeg}'])
    .pipe(gulp.dest('dist'));
});

// Copiar manifest e sw
gulp.task('pwa', function() {
  return gulp.src(['src/manifest.json', 'src/sw.js'])
    .pipe(gulp.dest('dist'));
});

// Build completo
gulp.task('build', gulp.series('clean', 'html', 'css', 'js', 'assets', 'pwa'));

// Watch para desenvolvimento
gulp.task('watch', function() {
  gulp.watch('src/**/*.html', gulp.series('html'));
  gulp.watch('src/css/**/*.css', gulp.series('css'));
  gulp.watch('src/js/**/*.js', gulp.series('js'));
  gulp.watch('src/**/*.{png,svg,ico}', gulp.series('assets'));
});

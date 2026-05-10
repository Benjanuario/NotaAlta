const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const javascriptObfuscator = require('gulp-javascript-obfuscator');
const rename = require('gulp-rename');
const del = require('del');

// Limpar pasta dist
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
  return gulp.src('src/**/*.css')
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('dist'));
});

// Configuração de Ofuscação MÁXIMA (Modo Deep)
const deepObfuscationOptions = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 1,     // Máximo achatamento do fluxo de controlo
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 1,         // Máxima injeção de código lixo
  debugProtection: true,                 // Dificulta o debugging no navegador
  debugProtectionInterval: 4000,         // Força um intervalo para travar o debugger
  disableConsoleOutput: true,            // Remove consoles.log
  identifierNamesGenerator: 'hexadecimal', // Nomes do tipo _0x1a2b3c
  log: false,
  numbersToExpressions: true,            // Converte números em expressões
  renameGlobals: false,                  // Mantém como falso para não quebrar chamadas entre ficheiros
  selfDefending: true,                   // Torna o código resistente a formatação
  simplify: true,
  splitStrings: true,
  splitStringsChunkLength: 10,           // Parte strings em pedaços de 10 caracteres
  stringArray: true,
  stringArrayCallsTransform: true,
  stringArrayEncoding: ['rc4'],          // Codificação forte das strings
  stringArrayIndexShift: true,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayWrappersCount: 5,           // Envolve as strings em 5 camadas
  stringArrayWrappersChainedCalls: true,
  stringArrayWrappersParametersMaxCount: 5,
  stringArrayWrappersType: 'function',
  stringArrayThreshold: 1,              // Aplica a TODAS as strings
  transformObjectKeys: true,
  unicodeEscapeSequence: false
};

// Ofuscar + Minificar JS
gulp.task('js', function() {
  return gulp.src('src/**/*.js')
    .pipe(javascriptObfuscator(deepObfuscationOptions))
    .pipe(uglify())
    .pipe(rename({ suffix: '.obf' }))
    .pipe(gulp.dest('dist'));
});

// Copiar imagens e ícones
gulp.task('images', function() {
  return gulp.src('src/**/*.{png,svg,ico,jpg,jpeg,webp}', { allowEmpty: true })
    .pipe(gulp.dest('dist'));
});

// Copiar manifest e service worker (se existirem)
gulp.task('pwa', function() {
  return gulp.src(['src/manifest.json', 'src/service-worker.js'], { allowEmpty: true })
    .pipe(gulp.dest('dist'));
});

// Build completo
gulp.task('build', gulp.series('clean', 'html', 'css', 'js', 'images', 'pwa'));

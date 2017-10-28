'use strict';

const autoprefixer = require('autoprefixer');
const babel = require('gulp-babel');
const browserSync = require('browser-sync').create();
const clean = require('gulp-clean');
const csso = require('gulp-csso');
const gulpif = require('gulp-if');
const lazypipe = require('lazypipe');
const newer = require('gulp-newer');
const postcss = require('gulp-postcss');
const postcssURL = require('postcss-url');
const rev = require('gulp-rev');
const revReplace = require('gulp-rev-replace');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify/composer')(require('uglify-es'), console);
const useref = require('gulp-useref');

/**
 * Installs the Gulp tasks provided by Sites.
 */
function installTasks(gulp) {
  const runSequence = require('run-sequence').use(gulp);

  const paths = {
    assets: './assets/',
    output: './_output/',
  };

  // ---------------------------------------
  // Main tasks

  // Serves site in development mode, with live reloading.
  gulp.task('serve', ['sites:build:dev'], () => {
    browserSync.init({
      server: {
        baseDir: './',
      },
    });
    gulp.watch('./css/**/*.scss', ['sites:css']);
    gulp.watch('./css/**/*.css', ['sites:css:raw']);
    gulp.watch('./js/**/*.js', ['sites:js']);
    gulp.watch(['./*.html', paths.assets + '**']).on('change', browserSync.reload);
  });

  // Rebuilds production version of site.
  gulp.task('build', cb => {
    runSequence('sites:clean', 'sites:build:prod', cb);
  });

  // ---------------------------------------
  // Utility tasks

  // Builds SASS files
  gulp.task('sites:css', () => {
    return gulp.src('./css/*.scss')
      // Ignore files that haven't been modified
      .pipe(newer({
        dest: paths.output + 'css/',
        ext: '.css',
        // Reload all CSS files if includes are modified
        extra: [
          './css/_includes/*.scss',
          './css/modules/*.scss',
          './css/partials/*.scss',
        ]
      }))
      .pipe(sourcemaps.init())
      .pipe(sass().on('error', sass.logError))
      .pipe(postcss([
        autoprefixer({
          browsers: ['last 5 versions'],
        })
      ]))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(paths.output + 'css/'))
      .pipe(browserSync.stream({match: '**/*.css'}));
  });

  // Copies regular CSS files to output directory
  gulp.task('sites:css:raw', () => {
    return gulp.src('./css/*.css')
      // Ignore files that haven't been modified
      .pipe(newer(paths.output + 'css/'))
      .pipe(sourcemaps.init())
      .pipe(postcss([
        autoprefixer({
          browsers: ['last 5 versions'],
        })
      ]))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(paths.output + 'css/'))
      .pipe(browserSync.stream({match: '**/*.css'}));
  });

  gulp.task('sites:js', () => {
    return gulp.src('./js/**/*.js')
      // Ignore files that haven't been modified
      .pipe(newer({
        dest: paths.output + 'js/',
      }))
      .pipe(sourcemaps.init())
      .pipe(babel({
        presets: [
          [require('babel-preset-env'), {
            browsers: ['last 3 versions', 'ie >= 9'],
          }]
        ],
      }))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(paths.output + 'js/'))
      .pipe(browserSync.stream({match: '**/*.js'}));
  });

  // Depends on all tasks required for development mode builds
  gulp.task('sites:build:dev', ['sites:css', 'sites:css:raw', 'sites:js']);

  // Removes all files from the output directory
  gulp.task('sites:clean', () => {
    return gulp.src(paths.output, {read: false})
      .pipe(clean());
  });

  // Injects hashes into asset filenames
  gulp.task('sites:build:prod:assets', () => {
    return gulp.src([paths.assets + '**'], {base: paths.assets})
      .pipe(rev())
      .pipe(gulp.dest(paths.output + 'assets/'))
      .pipe(rev.manifest())
      .pipe(gulp.dest(paths.output + 'assets/'))
  });

  // Builds the production version of the site
  gulp.task('sites:build:prod', ['sites:build:prod:assets', 'sites:build:dev'], () => {
    const assetManifest = gulp.src(paths.output + 'assets/rev-manifest.json');
    const cssTasks = lazypipe()
      .pipe(postcss, [
        postcssURL({
          // Rewrite CSS URLs from dev to prod. In prod, the HTML file is moved
          // one level deeper (from the root into _output), so we need to remove
          // one occurrence of "../" from the paths.
          url: asset => asset.url.replace(/^..\//, ''),
        })
      ])
      .pipe(csso);

    return gulp.src('./*.html')
      // Grab dependencies from HTML
      .pipe(useref({}, lazypipe().pipe(sourcemaps.init, {loadMaps: true})))
      .pipe(gulpif('*.css', cssTasks()))
      .pipe(gulpif('*.js', uglify()))
      // Rename files to include hash, but NOT .html files
      .pipe(gulpif('!*.html', rev()))
      // Replace CSS + JS references to include hash
      .pipe(revReplace())
      // Replace asset references to include hash
      .pipe(revReplace({manifest: assetManifest}))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(paths.output));
  });
}

module.exports = {
  installTasks,
};

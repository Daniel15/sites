Sites
=====
Sites is a small collection of useful utilities for building static websites, without having to configure complex build tools. It works out-of-the-box with close to zero configuration required.

Features
========
Sites includes everything you need for a modern static website, out-of-the-box:
- [SASS](http://sass-lang.com/).
- Minification and combination for CSS and JS.
- Live reloading via [Browsersync](https://www.browsersync.io/).
- Cache busting hashes are inserted into filenames for all static files, optimal caching via [far-future expires headers](https://developer.yahoo.com/performance/rules.html#expires).

Usage
=====
tl;dr: See the `example` directory in this repo for a sample site.

1. Add the required npm packages to your site, by running `yarn add --dev gulp sites` (or `npm install --save-dev gulp sites` if using npm rather than Yarn).

2. Create basic directory structure:
    - `assets` for any static files that do not need any processing (images, web fonts, etc).
    - `css` for SASS files. These are compiled into the `_output/css` directory.

3. Create `gulpfile.js` with the following contents:

    ```js
    const gulp = require('gulp');
    const sites = require('sites');

    sites.installTasks(gulp);
    ```

4. Build static HTML files, referencing CSS files from `_output/css`:

    ```html
    <!DOCTYPE html>
    <html>
    <head>
      <title>Hello world!</title>
      <link href="_output/css/main.css" rel="stylesheet">
    </head>
    <body>
      <h1>Hello world!</h1>
    </body>
    </html>
    ```

5. Run `gulp serve` to open the site in your browser. This uses BrowserSync, so any edits to the CSS or HTML files will automatically refresh the browser!

6. Configure CSS combination by adding some comments to the HTML file:

    ```html
    <!-- build:css css/combined.css -->
    <link href="_output/css/main.css" rel="stylesheet">
    <!-- endbuild -->
    ```

7. Run `gulp build` to build the production version of the site. The `_output` directory is now fully optimized and ready to push to production!


Changelog
=========
1.0.2 - 28th October 2017
-------------------------
- Copy regular .css files to the output directory, in addition to compiling Sass
- Live reload Sass file when  `css/modules` and `css/partials` directories change

1.0.1 - 3rd July 2017
---------------------
- Added support for JavaScript. JS files are compiled using Babel
- Include source maps for combined files

1.0 - 2nd July 2017
-------------------
- Initial release

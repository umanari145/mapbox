const mix = require('laravel-mix');

mix.js('js/src/index.js', 'js/dist/app.js')
   .sourceMaps('true');
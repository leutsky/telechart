import autoprefixer from 'autoprefixer';
import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import htmlTemplate from 'rollup-plugin-generate-html-template';
import babel from 'rollup-plugin-babel';

export default {
  input: './src/demo/index.js',
  output: {
    file: './dist/demo/index.js',
    format: 'umd',
    name: 'demoData',
  },
  watch: {
    include: './src/demo/**',
  },
  plugins: [
    resolve(),
    json(),
    postcss({
      extract: true,
      plugins: [
        autoprefixer(),
      ],
    }),
    babel(),
    htmlTemplate({
      template: './src/demo/index.html',
      target: './dist/demo/index.html',
    }),
  ],
};

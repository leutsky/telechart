import autoprefixer from 'autoprefixer';
import analyze from 'rollup-plugin-analyzer';
import json from 'rollup-plugin-json';
import postcss from 'rollup-plugin-postcss';
import resolve from 'rollup-plugin-node-resolve';
import compiler from '@ampproject/rollup-plugin-closure-compiler';
// import { terser } from "rollup-plugin-terser";
// import minify from 'rollup-plugin-babel-minify';
import serve from 'rollup-plugin-serve';

module.exports = [
  {
    input: 'demo/data.js',
    output: {
      file: 'dist/data.bundle.js',
    },
    plugins: [
      resolve(),
      json(),
    ],
  },
  {
    plugins: [
      serve({
        contentBase: ['dist', 'static'],
      }),
    ],
  },
];

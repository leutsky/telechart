import autoprefixer from 'autoprefixer';
import analyze from 'rollup-plugin-analyzer';
import json from 'rollup-plugin-json';
import postcss from 'rollup-plugin-postcss';
import resolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import babel from 'rollup-plugin-babel';

export default {
  input: './src/index.js',
  output: {
    file: 'dist/chart.js',
    format: 'umd',
    name: 'Chart', // Simple just this project
  },
  plugins: [
    analyze(),
    resolve(),
    postcss({
      extract: true,
      modules: {
        generateScopedName: 'tch-[hash:base64:5]',
      },
      plugins: [
        autoprefixer(),
      ],
      minimize: true,
    }),
    json(),
    // babel(),
    terser({
      compress: true,
    }),
  ],
};

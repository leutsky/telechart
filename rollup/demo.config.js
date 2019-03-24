import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';
import serve from 'rollup-plugin-serve';
import copy from 'rollup-plugin-copy';

export default [
  {
    input: 'demo/index.js',
    output: {
      file: 'dist/demo/index.js',
      format: 'umd',
      name: 'demoData',
    },
    plugins: [
      resolve(),
      json(),
      copy({
        'demo/index.html': 'dist/demo/index.html',
      }),
      serve('dist'),
    ],
  },
];

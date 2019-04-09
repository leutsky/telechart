import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload'

import buildConfig from './build-chart';
import demoConfig from './build-demo';

demoConfig.plugins.push(
  serve({
    contentBase: ['dist'],
    host: '0.0.0.0',
  }),
  livereload('dist'),
);

export default [
  buildConfig,
  demoConfig,
];

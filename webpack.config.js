const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const distDir = path.resolve(__dirname, 'dist');

module.exports = {
  mode: 'development',
  entry: './src/telechart.js',
  output: {
    filename: 'main.js',
    path: distDir,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
  ],
  devServer: {
    contentBase: distDir,
    port: 9000,
  },
};

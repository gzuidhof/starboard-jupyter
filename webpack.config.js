import * as path from "path";
import webpack from "webpack"
const {DefinePlugin} = webpack;

// const path = require('path');
// const webpack = require('webpack');
export default {
  entry: ['./src/index.ts'],
  output: {
    path: path.resolve('dist'),
    filename: 'index.js',
    module: true,
    libraryTarget: "module"
  },
  experiments: {
    outputModule: true
  },
  optimization: {
    minimize: false,
    usedExports: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.d.ts'],
  },
  mode: "production",
  module: {
    rules: [
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      { test: /\.md$/, use: 'raw-loader' },
      { test: /\.txt$/, use: 'raw-loader' },
      {
        test: /\.js$/,
        use: [/*'source-map-loader'*/],
        //enforce: 'pre',
        // eslint-disable-next-line no-undef
        exclude: /node_modules/
      },
      {
        test: /\.ts$/,
        use: [/*'source-map-loader', */'ts-loader'],
        //enforce: 'pre',
        // eslint-disable-next-line no-undef
        exclude: /node_modules/
      },
      { test: /\.(jpg|png|gif)$/, use: 'file-loader' },
      { test: /\.js.map$/, use: 'file-loader' },
      {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        use: 'url-loader?limit=10000&mimetype=application/font-woff'
      },
      {
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        use: 'url-loader?limit=10000&mimetype=application/font-woff'
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        use: 'url-loader?limit=10000&mimetype=application/octet-stream'
      },
      {
        test: /\.otf(\?v=\d+\.\d+\.\d+)?$/,
        use: 'url-loader?limit=10000&mimetype=application/octet-stream'
      },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, use: 'file-loader' },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: 'url-loader?limit=10000&mimetype=image/svg+xml'
      }
    ]
  },
  plugins: [
    new DefinePlugin({
    //   // Needed for Blueprint. See https://github.com/palantir/blueprint/issues/4393
      'process.env': '{}',
    //   // Needed for various packages using cwd(), like the path polyfill
    //   // process: { cwd: () => '/' }
    })
  ],
};
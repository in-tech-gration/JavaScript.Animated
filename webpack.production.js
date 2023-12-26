const path = require('path');
const { merge } = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (argv) => merge(require('./webpack.common.js')(argv), {
  mode: 'development',
  devtool: 'source-map',
  entry: {
    app: ['./dev/index.js'],
  },
  output: {
    path: path.resolve(__dirname, 'www'),
    filename: 'dev.js',
  },
  devServer: {
    port: 9000,
    static: {
      serveIndex: false,
      directory: path.join(__dirname, 'dev'),
    },
    client: {
      logging: 'none',
      overlay: false,
    },
    open: true,
    historyApiFallback: true,
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: './dev/index.html',
          to: 'index.html',
        },
        {
          from: './dev/style.css',
          to: 'style.css',
        },
        {
          from: './dev/pizza-slice',
          to: 'pizza-slice',
        },
        {
          from: './dev/pizza-slice',
          to: '',
        },
      ],
    }),
  ],
});

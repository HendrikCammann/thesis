const helpers = require('./helpers'),
  CopyWebpackPlugin = require('copy-webpack-plugin');

let config = {
  entry: {
    // 'web' : 'webpack-dev-server/client?http://' + require("os").hostname() + ':9090/',
    'main': helpers.root('/src/main.ts')
  },
  output: {
    path: helpers.root('/dist'),
    filename: 'js/[name].[hash].js'
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.js', '.html'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
    }
  },
  module: {
    rules: [{
        test: /\.ts$/,
        exclude: /node_modules/,
        enforce: 'pre',
        loader: 'tslint-loader'
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: 'awesome-typescript-loader'
      },
      {
        test: /\.html$/,
        loader: 'raw-loader',
        exclude: ['./src/index.html']
      }
    ],
  },
  plugins: [
    new CopyWebpackPlugin([{
      from: 'src/assets',
      to: './assets'
    }, ]),
  ],
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  }
};

module.exports = config;

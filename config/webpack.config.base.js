const helpers = require('./helpers'),
  WebpackPwaManifest = require('webpack-pwa-manifest'),
  ServiceWorkerWebpackPlugin = require('serviceworker-webpack-plugin'),
  CopyWebpackPlugin = require('copy-webpack-plugin');

const BrowserSyncPlugin = require('browser-sync-webpack-plugin');

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
    new ServiceWorkerWebpackPlugin({
      entry: helpers.root('src/sw.js'),
      excludes: ['**/.*', '**/*.map', '*.html'],
    }),
    new WebpackPwaManifest({
      name: 'Bidh',
      short_name: 'Bidh',
      description: 'Marathon Training Analysis',
      display: "standalone",
      orientation: "portrait",
      background_color: "#FBFAFA",
      theme_color: "#4F5B64",
      inject: true,
      ios: {
        'apple-mobile-web-app-title': 'Bidh',
        'apple-mobile-web-app-status-bar-style': 'white'
      },
      start_url: '.',
      icons: [
        {
          src: helpers.root('src/assets/appIcon/icon-512x512.png'),
          size: '512x512', // you can also use the specifications pattern
          ios: true
        },
        {
          src: helpers.root('src/assets/appIcon/icon-384x384.png'),
          size: '384x384', // you can also use the specifications pattern
          ios: true
        },
        {
          src: helpers.root('src/assets/appIcon/icon-192x192.png'),
          size: '192x192', // you can also use the specifications pattern
          ios: true
        },
        {
          src: helpers.root('src/assets/appIcon/icon-152x152.png'),
          size: '152x152', // you can also use the specifications pattern
          ios: true
        },
        {
          src: helpers.root('src/assets/appIcon/icon-144x144.png'),
          size: '144x144', // you can also use the specifications pattern
          ios: true
        },
        {
          src: helpers.root('src/assets/appIcon/icon-128x128.png'),
          size: '128x128', // you can also use the specifications pattern
          ios: true
        },
        {
          src: helpers.root('src/assets/appIcon/icon-96x96.png'),
          size: '96x96', // you can also use the specifications pattern
          ios: true
        },
        {
          src: helpers.root('src/assets/appIcon/icon-72x72.png'),
          size: '72x72', // you can also use the specifications pattern
          ios: true
        },
      ]
    }),
    new BrowserSyncPlugin({
      host: 'localhost',
      port: 3000,
      proxy: 'http://localhost:8080'
    }, {
      reload: false
    })
  ],
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  }
};

module.exports = config;

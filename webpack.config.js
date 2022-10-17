const path = require('path');
const webpack = require('webpack');
const BundleTracker = require('webpack-bundle-tracker');
const CompressionPlugin = require('compression-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
/*
 * For this one we needed to uninstall react-error-overlay see: https://stackoverflow.com/questions/70368760/react-uncaught-referenceerror-process-is-not-defined
 */

var config = function (env) {
  let p_path = '/static/little-world-frontend/dist/';
  console.log(env.LOCAL_DEBUG);

  if (env.LOCAL_DEBUG != '1') {
    p_path =
      'https://fra1.digitaloceanspaces.com/lw-object-storage-bucket/static/little-world-frontend/dist/'; //TODO: handle differently
  }
  console.log(p_path);
  return {
    context: __dirname,
    entry: {
      staticfiles: './src/index.js',
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src/'),
        '@django': path.resolve(__dirname, '../lw_backend/static/'),
      },
    },
    output: {
      path: path.join(__dirname, './assets/little-world-frontend/dist'),
      filename: '[name]-[hash].js',
      publicPath: p_path,
    },

    plugins: [
      new BundleTracker({
        filename: path.join(__dirname, './webpack-stats.json'),
      }),
      new CompressionPlugin(),
      new webpack.DefinePlugin({
        'process.env': JSON.stringify({}), // Tempoary fix, not using process
      }),
      ...(env.LOCAL_DEBUG === '1'
        ? []
        : [
            new UglifyJsPlugin({
              // Adds uglyfy ls only if in production
              test: /\.(js|jsx|tsx|ts)$/,
              uglifyOptions: {
                comments: false,
                warnings: false,
                parse: {},
                compress: {},
                mangle: true, // Note `mangle.properties` is `false` by default.
                output: null,
                toplevel: false,
                nameCache: null,
                ie8: false,
                keep_fnames: false,
              },
            }),
          ]),
    ],
    devtool:
      env.LOCAL_DEBUG === '1' ? 'eval-cheap-module-source-map' : 'source-map',
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: ['babel-loader'],
          resolve: {
            extensions: ['.js', '.jsx'],
          },
          include: [path.resolve(__dirname, 'src')],
        },
        {
          test: /\.svg$/,
          issuer: /\.jsx?$/,
          use: [
            'babel-loader',
            {
              loader: 'react-svg-loader',
              options: {
                svgo: {
                  plugins: [{ removeTitle: false }],
                  floatPrecision: 2,
                },
                jsx: true,
              },
            },
          ],
        },
        {
          test: /\.(ttf)$/,
          use: {
            loader: 'file-loader',
            options: {
              name: '[name].[hash:8].[ext]',
            },
          },
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(png|jpg|gif)$/,
          use: ['file-loader'],
        },
      ],
    },
  };
};

module.exports = (env, argv) => {
  if (argv.mode === 'production') {
    config.devtool = 'none';
  }
  return config(env);
};

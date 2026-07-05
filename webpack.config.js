const path = require('path');
const webpack = require('webpack');
const BundleTracker = require('webpack-bundle-tracker');
const CompressionPlugin = require('compression-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
/*
 * For this one we needed to uninstall react-error-overlay see: https://stackoverflow.com/questions/70368760/react-uncaught-referenceerror-process-is-not-defined
 */

var config = function (env) {
  let p_path = '/static/little-world-frontend/dist/';

  if (env.LOCAL_DEBUG != '1') {
    p_path =
      'https://fra1.digitaloceanspaces.com/lw-object-storage-bucket/static/little-world-frontend/dist/'; //TODO: handle differently
  }

  return {
    context: __dirname,
    entry: {
      staticfiles: './src/index.tsx',
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
        filename: 'webpack-stats.json',
        path: __dirname,
      }),
      new CompressionPlugin(),
      new webpack.DefinePlugin({
        'process.env': JSON.stringify({}), // Tempoary fix, not using process
      }),
      ...(env.LOCAL_DEBUG === '1'
        ? []
        : [
            new TerserPlugin({
              terserOptions: {
                compress: {
                  drop_console: true,
                  drop_debugger: true,
                },
                mangle: true,
                output: {
                  comments: false,
                },
              },
              extractComments: false,
            }),
          ]),
    ],
    devtool:
      env.LOCAL_DEBUG === '1' ? 'eval-cheap-module-source-map' : 'source-map',
    optimization: {
      moduleIds: 'deterministic',
      chunkIds: 'deterministic',
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: /node_modules/,
          use: ['babel-loader'],
          resolve: {
            extensions: ['.js', '.jsx', '.tsx', '.ts'],
          },
          include: [path.resolve(__dirname, 'src')],
        },
        {
          test: /\.(md|mdx)$/,
          type: 'asset/source',
        },
        {
          test: /\.svg$/,
          use: [
            {
              loader: '@svgr/webpack',
            },
            {
              loader: 'file-loader',
            },
          ],
          type: 'javascript/auto',
          issuer: {
            and: [/\.(ts|tsx|js|jsx|md|mdx)$/],
          },
        },
        {
          test: /\.(jpg|png|webp|gif|ttf|woff|woff2|eot|otf)$/,
          use: {
            loader: 'file-loader',
            options: {
              name: '[name].[hash:8].[ext]',
            },
          },
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader', 'postcss-loader'],
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

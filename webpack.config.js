const path = require('path');
const DotenvWebpackPlugin = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 9000,
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  require('tailwindcss'),
                  require('autoprefixer'),
                ],
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new DotenvWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'], // Automatically provide Buffer
      process: 'process/browser', // Automatically provide process
    }),
  ],
  resolve: {
    fallback: {
      assert: require.resolve('assert/'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      url: require.resolve('url/'),
      crypto: require.resolve('crypto-browserify'),
      buffer: require.resolve('buffer/'),
      vm: require.resolve('vm-browserify'),
      stream: require.resolve('stream-browserify'),
      path: require.resolve('path-browserify'),
      os: require.resolve('os-browserify/browser'),
    },
  },
};

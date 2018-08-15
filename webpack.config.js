const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = function (_, { mode = 'development' }) {
  return {
    mode,
    context: path.join(__dirname, 'src'),
    entry: {
      index: './index.js',
    },
    output: {
      path: path.join(__dirname, 'www'),
      filename: `js/[name]${mode === 'production' ? '.min' : ''}.js`,
    },
    // devtool: 'sourcemap',
    module: {
      rules: [
        {
          test: /\.s?css$/,
          use: [ MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader' ],
        },
        {
          test: /\.html$/,
          use: [ 'html-loader' ],
        },
        {
          test: /\.(woff2?|eot|ttf)(\?.*)?$/i,
          use: getUrlLoader('./fonts/[name].[ext]'),
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: `[name]${mode === 'production' ? '.min' : ''}.css`,
      }),
      new HtmlWebpackPlugin({
        template: './index.html',
      }),
    ],
    optimization: {
      minimizer: [
        new UglifyJsPlugin({
          cache: true,
          parallel: true,
          sourceMap: true, // set to true if you want JS source maps
        }),
        new OptimizeCSSAssetsPlugin({}),
      ],
    },
  };
};

function getUrlLoader (name = '[name].[ext]') {
  return {
    loader: 'url-loader',
    options: {
      limit: 1000,
      name: name,
    },
  };
}

import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';

const mode = process.env.NODE_ENV || 'development';

export default {
  mode,
  entry: path.resolve('.', 'src', 'index.js'),
  output: {
    filename: 'main.js',
    path: path.resolve(dirname(fileURLToPath(import.meta.url)), 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.(css)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          'css-loader',
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html',
    }),
    new MiniCssExtractPlugin({
      filename: 'main.css',
    }),
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['./dist/*.*'],
    }),
  ],
  devtool: 'inline-source-map',
  devServer: {
    host: 'localhost',
    static: './dist',
    port: 8080,
    compress: true,
  },
};

import { resolve as r } from 'path';

export default {
  resolve: {
    extensions: ['', '.js', '.jsx'],
  },

  entry: {
    background: r('./src/background.js'),
    hook: r('./src/hook.js'),
    inject: r('./src/inject.js'),
    popup: r('./src/popup.js'),
  },

  output: {
    path: r('./extension/lib'),
    filename: '[name].js',
  },

  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel',
      },
      {
        test: /\.css?$/,
        loader: 'style!css?modules',
      },
    ],
  },
};

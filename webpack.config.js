const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    'modal': './example/index.js',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.svg$/,
        use: ['svg-inline-loader'],
      },
    ],
  },
  output: {
    libraryTarget: 'global',
    path: path.resolve(__dirname, 'build'), //directory for output files
    filename: '[name].min.js', //using [name] will create a bundle with same file name as source
  },
};

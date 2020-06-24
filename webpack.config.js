const Dotenv = require('dotenv-webpack');

module.exports = {
  target: 'webworker',
  entry: './index.js',
  devtool: 'cheap-module-source-map',
  mode: 'production',
  plugins: [
    new Dotenv({
      path: './.env',
    }),
  ],
};

const path = require('path');
const {
  EnvironmentPlugin
} = require('webpack');
const {
  config: dotenvConfig
} = require('dotenv');
const WebpackShellPluginNext = require('webpack-shell-plugin-next');
const ESLintPlugin = require('eslint-webpack-plugin');
const NodeTargetPlugin = require('webpack/lib/node/NodeTargetPlugin');

dotenvConfig();

const scriptCommand = process.argv[2] === '--mode=production' ?
  'node dist/index.js' :
  'nodemon dist/index.js --watch';

module.exports = {
  entry: './src/index.ts',
  module: {
    rules: [{
      test: /\.ts?$/,
      use: 'ts-loader',
      exclude: /node_modules/,
    }, ],
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      'http': require.resolve('http'),
      'uuid': 'uuid/dist/esm-browser',
    },
  },
  plugins: [
    new EnvironmentPlugin(['PORT']),
    new WebpackShellPluginNext({
      onBuildEnd: {
        scripts: [scriptCommand],
        blocking: false,
        parallel: true
      }
    }),
    new ESLintPlugin({
      emitError: true,
      emitWarning: true,
      failOnError: true
    }),
    new NodeTargetPlugin()
  ]
};

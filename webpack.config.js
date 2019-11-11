var CopyWebpackPlugin = require('copy-webpack-plugin');
var path = require('path');

module.exports = function (env) {
  env = env || {};

  var config = {
    entry: './src/app.js',
    output: {
      libraryTarget: 'umd',
      path: path.resolve(__dirname, 'app'),
      filename: 'app.js'
    },
    resolve: {
      modules: [
        path.join(__dirname, 'src'),
        path.join(__dirname, 'lib'),
        path.join(__dirname, 'node_modules')
      ]
    },
    module: {
      rules: [{
        test: /\.glsl$/,
        loader: 'raw-loader'
      }]
    },
    plugins: [],
    devServer: {
        contentBase: path.join(__dirname, 'app'),
        compress: true,
        port: 9000
      }
  };
  
  config.mode = (env.release || env.website) ? 'production' : 'development';


  config.plugins.push(new CopyWebpackPlugin([
    { from: './src/index.html', to: './index.html' },
    { from: './src/models', to: './models' },
    { from: './src/textures', to: './textures' },
    { from: './src/site.css', to: './site.css' }
  ]));

  if (env.release) {
    config.module.rules.push({
      test: /\.js$/,
      use: [{
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env']
        }
      }]
    });
  }

  return config;
};
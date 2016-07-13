/*
	This configuration is for making a library out of everything that is in the /static/app dir

	Webpack config options:
		https://github.com/webpack/docs/wiki/configuration

	About the bootstrap-loader and the .bootstraprc file:
		https://github.com/shakacode/bootstrap-loader

	Random list of useful pages to read to understand webpack, babel, react:
		http://webpack.github.io/docs/usage.html
		https://www.sitepoint.com/javascript-modules-bundling-transpiling/
		http://krasimirtsonev.com/blog/article/javascript-library-starter-using-webpack-es6
		https://github.com/petehunt/webpack-howto
		https://medium.com/@dtothefp/why-can-t-anyone-write-a-simple-webpack-tutorial-d0b075db35ed#.l95n3w625
		https://github.com/webpack/react-starter

	TODO (to improve):
		- d3 is not nicely included via the /static/app or this config (so a separate include is still needed)
		- This might optimize the size of the benglabs.js: https://github.com/lodash/lodash-webpack-plugin
*/

var webpack = require('webpack');
var path = require('path');

var BUILD_DIR = path.resolve(__dirname, 'public/assets');
var APP_DIR = path.resolve(__dirname, 'app');

var config = {
	entry: [ 'bootstrap-loader', APP_DIR + '/index.jsx'],

	output: {
		path: BUILD_DIR,
		publicPath: '/static/public/assets/',
		filename: 'benglabs.js',
		library: 'clariah',
    	libraryTarget: 'umd',
    	umdNamedDefine: true
	},

	resolve: { extensions: ['', '.js', '.jsx'] },

	module : {
		loaders : [
			{
				test : /\.jsx?/,
				include : APP_DIR,
				loader : 'babel',
				exclude: /node_modules/
			},
			{ test:/bootstrap-sass[\/\\]assets[\/\\]javascripts[\/\\]/, loader: 'imports?jQuery=jquery' },
			{
	        	test: /\.css$/,
	        	loaders: [
					'style',
					'css?modules&importLoaders=1&localIdentName=[name]__[local]__[hash:base64:5]',
					'postcss',
				],
			},
			{
				test: /\.scss$/,
	        	loaders: [
					'style',
					'css?modules&importLoaders=2&localIdentName=[name]__[local]__[hash:base64:5]',
					'postcss',
					'sass',
				],
			},
			{ test: /\.(woff2?|svg)$/, loader: 'url?limit=10000' },
    		{ test: /\.(ttf|eot)$/, loader: 'file' },
		]
	}

};

module.exports = config;
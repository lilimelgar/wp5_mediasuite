/*
	This configuration is for the production environment (it basically adds JSUglify)
*/

var webpack = require('webpack');
var path = require('path');

var BUILD_DIR = path.resolve(__dirname, 'public/assets');
var APP_DIR = path.resolve(__dirname, 'app');

var config = {
	entry: [ 'bootstrap-loader', APP_DIR + '/index.jsx'],

	devtool: 'source-map',

	output: {
		path: BUILD_DIR,
		publicPath: '/static/public/assets/',
		filename: 'benglabs.min.js',
		library: 'clariah',
		libraryTarget: 'umd'
	},

	plugins: [
		new webpack.optimize.UglifyJsPlugin({minimize: true})
	],

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
	},

	externals: {
        // Use external version of React
        "react": "React",
        "react-dom": "ReactDOM"
    }
};

module.exports = config;
/*
	This configuration is for making a library out of everything that is in the /static/app dir

	Webpack config options:
		https://github.com/webpack/docs/wiki/configuration

	How to make a proper component library
		https://github.com/webpack/webpack/tree/master/examples/multi-part-library
		http://www.reactjsx.com/
		http://stackoverflow.com/questions/33108737/unable-to-use-es6-export-module-from-file-in-babel

	About the bootstrap-loader and the .bootstraprc file:
		https://github.com/shakacode/bootstrap-loader

	List of useful pages to read to understand webpack, babel & react:
		http://webpack.github.io/docs/usage.html
		https://www.sitepoint.com/javascript-modules-bundling-transpiling/
		http://krasimirtsonev.com/blog/article/javascript-library-starter-using-webpack-es6
		https://github.com/petehunt/webpack-howto
		https://medium.com/@dtothefp/why-can-t-anyone-write-a-simple-webpack-tutorial-d0b075db35ed#.l95n3w625
		https://github.com/webpack/react-starter
		https://www.bensmithett.com/smarter-css-builds-with-webpack/
		https://docs.google.com/presentation/d/1afMLTCpRxhJpurQ97VBHCZkLbR1TEsRnd3yyxuSQ5YY/edit#slide=id.p

	Generate docs (TODO):
		- Try this one: https://github.com/pocotan001/react-styleguide-generator
		- or convert all jsx files to js and run: npm run doc (which calls the esdoc)
			- See: http://en.blog.koba04.com/2015/06/28/esdoc-documentation-for-react-and-es6/

	TODO (to improve):
		- This might optimize the size of the benglabs.js: https://github.com/lodash/lodash-webpack-plugin
		- Optimize CSS imports per page: https://www.bensmithett.com/smarter-css-builds-with-webpack/
		- split up different groups of functionalities in multiple bundles/libraries/webpack.config.js'es
*/

var webpack = require('webpack');
var path = require('path');

var BUILD_DIR = path.resolve(__dirname, 'public/assets');
var APP_DIR = path.resolve(__dirname, 'app');

var config = {
	entry:
		[ 'bootstrap-loader', APP_DIR + '/index.jsx']
	,

	output: {
		path: BUILD_DIR,
		publicPath: '/static/public/assets/',
		filename: 'benglabs.js',
		library: 'clariah',
		libraryTarget: 'umd'
		//umdNamedDefine: true
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
	},

	externals: {
        // Use external version of React
        "react": "React",
        "react-dom": "ReactDOM"
    }
};

module.exports = config;
const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const config = {
    entry: ['./sass/main.scss'],
    output: {
        path: path.resolve(__dirname, 'css'),
        filename: './main.css'
    },
    watchOptions: {
        aggregateTimeout: 200,
        poll: 1000,
        ignored: /(node_modules|vendor|images|fonts|js)/
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract(
                    {
                        fallback: 'style-loader',
                        use: [
                            {
                                loader: 'css-loader',
                                options: {
                                    minimize: true || {/* CSSNano Options */}
                                }
                            },
                            'sass-loader'
                        ]
                    }
                )
            },
            {
                test: /\.woff($|\?)|\.woff2($|\?)|\.ttf($|\?)|\.eot($|\?)|\.svg($|\?)/,
                loader: 'url-loader'
            },
        ]
    },
    plugins: [
        new ExtractTextPlugin({
            filename: './main.css',
            allChunks: true,
        })
    ]
};

module.exports = config;
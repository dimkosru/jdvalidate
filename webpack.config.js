const webpack = require('webpack');
const MinifyPlugin = require('babel-minify-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

const NODE_ENV = process.env.NODE_ENV || 'development';

const config = {
    entry: {
        'jedi-validate': './src/index.js',
        'jedi-validate.min': './src/index.js',
    },
    devtool: 'source-map',
    output: {
        path: `${__dirname}/dist`,
        filename: '[name].js',
        libraryTarget: 'umd',
        library: 'JediValidate',
        sourceMapFilename: '[name].js.map',
        publicPath: '/dist/',
    },
    module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.js$/,
                exclude: /(node_modules|bower_components|tests)/,
                loader: 'eslint-loader',
            },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader?cacheDirectory=cache',
            },
            {
                test: /\.json$/,
                loader: 'json-loader',
            },
        ],
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(NODE_ENV),
            },
        }),
    ],
};

if (NODE_ENV === 'production') {
    config.plugins.push(
        new MinifyPlugin(
            {
                removeDebugger: true,
            },
            {
                test: /\.min\.js$/,
                comments: false,
            },
        ),
    );

    config.plugins.push(
        new CompressionPlugin({
            test: /\.min\.js$/,
        }),
    );
}

module.exports = config;

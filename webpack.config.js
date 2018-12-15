const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

const NODE_ENV = process.env.NODE_ENV || 'development';

const config = {
    mode: 'none',
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
                loader: 'babel-loader?cacheDirectory=true',
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
        new UglifyJsPlugin({
            cache: true,
            parallel: true,
            test: /\.min\.js$/,
            sourceMap: true,
            extractComments: true,
        }),
    );

    config.plugins.push(new webpack.optimize.ModuleConcatenationPlugin());
    config.plugins.push(new webpack.NoEmitOnErrorsPlugin());

    config.plugins.push(new CompressionPlugin({ test: /\.min\.js$/ }));
} else {
    config.plugins.push(new webpack.NamedModulesPlugin());
}

module.exports = config;

var webpack = require('webpack');

module.exports = {
    entry: {
        'jedi-validate': './src/jedi-validate.js',
        'jedi-validate.min': './src/jedi-validate.js',
    },
    devtool: 'source-map',
    output: {
        path: __dirname + '/dist',
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
        new webpack.optimize.UglifyJsPlugin({
            include: /\.min\.js$/,
            minimize: true,
        }),
    ],
};

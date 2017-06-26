module.exports = function (config) {
    config.set({
        browsers: ['PhantomJS'],
        frameworks: ['mocha', 'chai'],
        files: [
            './tests/**/*.js',
        ],
        preprocessors: {
            './tests/**/*.js': ['webpack'],
        },
        reporters: ['mocha'],
        mochaReporter: {
            showDiff: true,
        },
        webpack: {
            module: {
                rules: [
                    {
                        test: /\.js/,
                        exclude: /(node_modules|bower_components)/,
                        loader: 'babel-loader?cacheDirectory=cache',
                    },
                    {
                        test: /\.json$/,
                        loader: 'json-loader',
                    },
                ],
            },
        },
    });
};

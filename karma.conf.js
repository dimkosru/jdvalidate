module.exports = function (config) {
    config.set({
        browsers: ['ChromeHeadless'],
        frameworks: ['mocha', 'chai'],
        files: [
            'tests/**/*.js',
        ],
        preprocessors: {
            'tests/**/*.js': ['webpack'],
        },
        reporters: ['mocha', 'coverage', 'coveralls'],
        mochaReporter: {
            showDiff: true,
        },
        coverageReporter: {
            type: 'lcov',
            dir: 'coverage',
        },
        webpack: {
            module: {
                rules: [
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
        },
    });
};

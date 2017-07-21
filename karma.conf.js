module.exports = function (config) {
    config.set({
        browsers: ['Chrome'],
        frameworks: ['mocha', 'chai'],
        files: [
            'tests/**/*.js',
        ],
        preprocessors: {
            'tests/**/*.js': ['webpack'],
        },
        reporters: ['mocha', 'coverage'],
        mochaReporter: {
            showDiff: true,
        },
        coverageReporter: {
            dir: 'coverage',
            subdir: '.',
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

var webpack = require('webpack'),
    path = require('path'),
    yargs = require('yargs');

var libraryName = 'probabilistic-earley-parser',
    plugins = [],
    outputFile;
var VERSION = require('./version').default;
if (yargs.argv.p) {
    outputFile = libraryName + '.' + VERSION + '.min.js';
} else {
    outputFile = libraryName + '.' + VERSION + '.js';
}

var config = {
    entry: [
        __dirname + '/src/index.ts'
    ],
    devtool: 'source-map',
    output: {
        path: path.join(__dirname, '/'),
        filename: outputFile,
        library: libraryName,
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    module: {
        preLoaders: [
            { test: /\.tsx?$/, loader: 'tslint', exclude: /node_modules/ }
        ],
        loaders: [
            { test: /\.tsx?$/, loader: 'ts', exclude: /node_modules/ }
        ]
    },
    resolve: {
        root: path.resolve('./src'),
        extensions: [ '', '.js', '.ts', '.jsx', '.tsx' ]
    },
    plugins: plugins,

    // Individual Plugin Options
    tslint: {
        emitErrors: true,
        failOnHint: true
    }
};

module.exports = config;
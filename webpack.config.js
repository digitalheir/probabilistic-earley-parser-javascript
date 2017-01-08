var webpack = require('webpack'),
    path = require('path'),
    yargs = require('yargs');

var libraryName = 'probabilistic-earley-parser',
    plugins = [
        new webpack.LoaderOptionsPlugin({
            options: {
                tslint: {
                    emitErrors: true,
                    failOnHint: true
                }
            }
        })
    ],
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
        rules: [
            {
                enforce: 'pre',
                test: /\.tsx?$/,
                loader: 'tslint-loader',
                exclude: /node_modules/
            },
            {
                test: /\.tsx?$/,
                loader: ['babel-loader', 'awesome-typescript-loader'],
                exclude: /node_modules/
            }
        ],
        loaders: [
        ]
    },
    resolve: {
        extensions: [ '.js', '.ts', '.jsx', '.tsx' ]
    },
    plugins: plugins
};

module.exports = config;
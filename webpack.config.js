const webpack = require('webpack');
const path = require('path');
const yargs = require('yargs');

const libraryName = 'probabilistic-earley-parser',
    plugins = [
        new webpack.LoaderOptionsPlugin({
            options: {
                tslint: {
                    emitErrors: true,
                    failOnHint: true
                }
            }
        })
    ];

let outputFile;
const VERSION = require('./version').default;
if (yargs.argv.p) {
    outputFile = `${libraryName}.${VERSION}.min.js`;
} else {
    outputFile = `${libraryName}.${VERSION}.js`;
}

const config = {
    entry: [
        __dirname + '/src/index.ts'
    ],
    devtool: 'source-map',
    output: {
        path: path.join(__dirname, '/'),
        filename: outputFile,
        library: libraryName,

        libraryTarget: "umd",
        umdNamedDefine: true
    },
    module: {
        rules: [
            // {
            //     enforce: 'pre',
            //     test: /\.tsx?$/,
            //     loader: 'tslint-loader',
            //     exclude: /node_modules/
            // },
            {
                test: /\.tsx?$/,
                loader: ['babel-loader', 'ts-loader'],
                exclude: /node_modules/
            }
        ],
        loaders: []
    },
    resolve: {
        extensions: ['.js', '.ts', '.jsx', '.tsx']
    },
    plugins: plugins
};

module.exports = config;
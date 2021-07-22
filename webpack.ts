import HtmlWebpackPlugin from 'html-webpack-plugin'
import { join } from 'path'
import 'webpack-dev-server'

const port = parseInt(process.env.PORT || '', 10) || 8088

export default {
    entry: {
        main: join(__dirname, 'demo', 'index.ts')
    },

    output: {
        filename: '[name].js',
        chunkFilename: '[id].js'
    },

    devServer: {
        port,
        contentBase: join(process.cwd(), './dist'),
        watchContentBase: true,
        stats: 'none',
        quiet: false,
        open: true,
        historyApiFallback: {
            rewrites: [{ from: /./, to: '404.html' }]
        },
        host: '0.0.0.0',
        public: `localhost:${port}`,
        disableHostCheck: true
    },

    devtool: 'eval-cheap-module-source-map',

    module: {
        rules: [
            {
                test: /\.((png)|(jpe?g)|(eot)|(woff)|(woff2)|(ttf)|(svg)|(gif))(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'file-loader',
                options: {
                    name: (_resourcePath: string) => {
                        return `[contenthash].[ext]`
                    }
                }
            },

            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },

    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },

    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            inject: true,
            minify: false,
            scriptLoading: 'defer'
        })
    ]
}

import compiler from '@ampproject/rollup-plugin-closure-compiler'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'

export default {
    input: 'src/index.ts',
    output: {
        dir: 'dist',
        format: 'esm',
        exports: 'named',
        sourcemap: true
    },
    plugins: [
        typescript({
            include: [
                'src/**/*.ts'
            ],
            declaration: true,
            declarationDir: './dist'
        }),
        commonjs(),
        nodeResolve(),
        terser(),
        compiler({
            language_in: 'ECMASCRIPT_2018',
            language_out: 'ECMASCRIPT_2017',
            compilation_level: 'ADVANCED_OPTIMIZATIONS'
        })
    ]
}

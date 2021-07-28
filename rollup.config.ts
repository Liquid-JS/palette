import compiler from '@ampproject/rollup-plugin-closure-compiler'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import { randomUUID } from 'crypto'
import { writeFileSync } from 'fs'
import os from 'os'
import { join } from 'path'
import { terser } from 'rollup-plugin-terser'

const tmp = join(os.tmpdir(), randomUUID())
writeFileSync(tmp, `/**
* @fileoverview Externs built via derived configuration from Rollup or input code.
* This extern contains the cjs typing info for modules.
* @externs
*/

/**
* @param img
* @return {{
*   qEntropy: number,
*   qWeight: number,
*   qRgb: Array.<number>,
*   qHsl: Array.<number>,
*   qLab: Array.<number>,
* }[]}
*/
function quantize(img){}`)

export default {
    input: 'src/index.ts',
    output: {
        dir: 'dist',
        format: 'es',
        exports: 'named',
        sourcemap: true
    },
    plugins: [
        typescript({
            include: [
                'src/**/*.ts'
            ],
            declaration: true,
            declarationDir: './dist',
            sourceMap: true,
            inlineSources: true
        }),
        commonjs(),
        nodeResolve(),
        terser({ format: { comments: 'all' } }),
        compiler({
            language_in: 'ECMASCRIPT_2018',
            language_out: 'ECMASCRIPT_2017',
            compilation_level: 'ADVANCED_OPTIMIZATIONS',
            externs: [tmp],
            assume_function_wrapper: false
        }),
        terser()
    ]
}

import { randomUUID } from 'crypto'
import { writeFile } from 'fs/promises'
import os from 'os'
import { join } from 'path'
import typescript from '@rollup/plugin-typescript'
import terser from '@rollup/plugin-terser'
import compiler from '@liquid-js/rollup-plugin-closure-compiler'

const tmp = join(os.tmpdir(), randomUUID())
await writeFile(tmp, `/**
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
        dir: './lib',
        format: 'esm'
    },
    plugins: [
        typescript({
            declaration: true,
            declarationDir: './lib/',
            inlineSources: true,
            tsconfig: 'tsconfig.lib.json'
        }),
        terser({ format: { comments: 'all' } }),
        compiler({
            language_in: 'ECMASCRIPT_2020',
            language_out: 'ECMASCRIPT_2020',
            compilation_level: 'ADVANCED_OPTIMIZATIONS',
            externs: [tmp],
            assume_function_wrapper: false
        }),
        terser()
    ]
}

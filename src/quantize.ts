import TinyQueue from 'tinyqueue'
import { ColorTupple, rgb2hsl, rgb2lab } from './utils/color'
import { ImageDataTuple } from './utils/image'
import { Box, entropy } from './utils/operations'
import { lanczosResize } from './utils/resize'

const MAX_PX = 128 * 128
const MAX_BX = 32

class Entry {
    readonly entropy: number
    readonly weight: number
    readonly size: number[]
    readonly mean: ColorTupple

    constructor(readonly data: Box) {
        const dmin = new Array<number>()
        const dmax = new Array<number>()
        for (let i = 0; i < 3; i++) {
            dmin.push(data.reduce((t, v) => t < v.rgb[i] ? t : v.rgb[i], Number.MAX_VALUE))
            dmax.push(data.reduce((t, v) => t > v.rgb[i] ? t : v.rgb[i], Number.MIN_VALUE))
        }
        const dim = dmin.map((v, i) => dmax[i] - v)
        this.size = dim

        const r = entropy(data)
        this.weight = r.weight
        this.entropy = r.entropy
        this.mean = r.mean
    }
}

export interface QuantizeResult {
    qWeight: number
    qEntropy: number
    qRgb: ColorTupple
    qHsl: ColorTupple
    qLab: ColorTupple
}

export function quantize([swidth, sheight, data]: ImageDataTuple) {
    let width = swidth
    let height = sheight

    if (swidth * sheight > MAX_PX) {
        const ratio = Math.sqrt(swidth * sheight / MAX_PX)
        width = Math.round(swidth / ratio)
        height = Math.round(sheight / ratio)
        data = lanczosResize([swidth, sheight, data], { width, height })[2]
    }

    const map: { [key: string]: number } = {}
    for (let i = 0; i < width * height; i++) {
        const rgb = Array.from(data.slice(i * 4, i * 4 + 3)) as ColorTupple
        const lab = rgb2lab(rgb)
        if (
            lab[0] > 95 // white
            || lab[0] < 5 // black
            || (lab[1] * lab[1] + lab[2] * lab[2]) < 25 // gray
        )
            continue

        const key = rgb.map(p => Math.round(p * 100)).join('*')
        if (!(key in map))
            map[key] = 0

        map[key] += data[i * 4 + 3] / 255
    }

    const box: Box = Object.entries(map).map(([k, w]) => ({
        rgb: k.split('*').map(parseFloat).map(v => v / 100) as ColorTupple,
        w
    }))

    const queue = new TinyQueue<Entry>([], (a, b) => b.entropy - a.entropy)
    queue.push(new Entry(box))

    let el: Entry | undefined
    const boxes = []
    while (el = queue.pop()) {
        if (boxes.length + 1 + queue.length >= MAX_BX || el.entropy < 10) {
            boxes.push(el)
            continue
        }

        let maxDim = 0
        for (let i = 1; i < el.size.length; i++)
            if (el.size[i] > el.size[maxDim])
                maxDim = i

        const ks = Array.from(new Set(el.data.map(p => p.rgb[maxDim].toFixed(2)))).map(parseFloat)
        if (ks.length < 1) {
            boxes.push(el)
            continue
        }

        const elData = el.data
        const ent = ks.map((k) => {
            const e1 = new Entry(elData.filter(v => v.rgb[maxDim] < k))
            const e2 = new Entry(elData.filter(v => v.rgb[maxDim] >= k))
            if (e1.entropy == 0 || e2.entropy == 0)
                return { k, e: Number.MAX_VALUE, e1, e2 }
            else
                return { k, e: Math.pow(e1.entropy, 3) + Math.pow(e2.entropy, 3), e1, e2 }
        })

        let min = ent[0]
        ent.forEach(e => {
            if (e.e < min.e)
                min = e
        })

        const low = min.e1
        const high = min.e2
        if (low.data.length && high.data.length) {
            queue.push(low)
            queue.push(high)
        } else {
            boxes.push(el)
        }
    }

    boxes.sort((a, b) => b.weight - a.weight)
    const wSum = boxes.reduce((t, v) => t + v.weight, 0)

    return boxes.map(b => ({
        qEntropy: b.entropy,
        qWeight: b.weight / wSum,
        qRgb: b.mean,
        qHsl: rgb2hsl(b.mean),
        qLab: rgb2lab(b.mean)
    } as QuantizeResult))
}

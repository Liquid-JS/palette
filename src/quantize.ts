import TinyQueue from 'tinyqueue'
import { ColorTupple, rgb2lab } from './utils/color'
import { baseLength, createCanvas } from './utils/image'
import { Box, entropy } from './utils/operations'
import { lanczosResize } from './utils/resize'

const MAX_PX = 128 * 128
const MAX_BX = 32

class Entry {
    readonly volume: number
    readonly size: number[]
    readonly mid: number[]
    readonly entropy: number
    readonly weight: number

    constructor(readonly data: Box) {
        const dmin = new Array<number>()
        const dmax = new Array<number>()
        for (let i = 0; i < 3; i++) {
            dmin.push(data.reduce((t, v) => t < v.rgb[i] ? t : v.rgb[i], Number.MAX_VALUE))
            dmax.push(data.reduce((t, v) => t > v.rgb[i] ? t : v.rgb[i], Number.MIN_VALUE))
        }
        this.weight = data.reduce((t, v) => t + v.w, 0)
        const dim = dmin.map((v, i) => dmax[i] - v)
        const mid = dmin.map((v, i) => (dmax[i] + v) / 2)
        this.volume = dim.reduce((t, v) => t * v, 1)
        this.entropy = entropy(data)
        this.size = dim
        this.mid = mid
    }
}

export function quantize(img: CanvasImageSource) {
    const start = new Date().getTime()
    const swidth = baseLength(img.width)
    const sheight = baseLength(img.height)

    let width = swidth
    let height = sheight

    let canvas: HTMLCanvasElement

    if (swidth * sheight > MAX_PX) {
        const ratio = Math.sqrt(swidth * sheight / MAX_PX)
        width = Math.round(swidth / ratio)
        height = Math.round(sheight / ratio)
        canvas = createCanvas(width, height)
        lanczosResize(img, { canvas })
    } else {
        if (img instanceof HTMLCanvasElement)
            canvas = img
        else {
            canvas = createCanvas(width, height)
            const tctx = canvas.getContext('2d')
            if (!tctx)
                throw new Error('Unable to obtain canvas context')
            tctx.drawImage(img, 0, 0)
        }
    }

    const ctx = canvas.getContext('2d')
    if (!ctx)
        throw new Error('Unable to obtain canvas context')
    const data = ctx.getImageData(0, 0, width, height)

    const map: { [key: string]: number } = {}
    for (let i = 0; i < data.width * data.height; i++) {
        const c = rgb2lab([data.data[i * 4], data.data[i * 4 + 1], data.data[i * 4 + 2]])
        if (c[0] < 5 || c[0] > 95)
            continue

        const color = [data.data[i * 4], data.data[i * 4 + 1], data.data[i * 4 + 2]] as ColorTupple
        // const color = c

        const k = color.map(p => Math.round(p * 100)).join('*')
        if (!(k in map))
            map[k] = 0

        map[k] += data.data[i * 4 + 3] / 255
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
        if (boxes.length + 1 + queue.length >= MAX_BX) {
            boxes.push(el)
            continue
        }

        let i = 0
        for (let j = 1; j < el.size.length; j++)
            if (el.size[j] > el.size[i])
                i = j

        const map: { [key: string]: number } = {}
        el.data.forEach(p => {
            const k = p.rgb[i].toFixed(2)
            if (!(k in map))
                map[k] = 0

            map[k] += p.w
        })

        let w = 0
        const bp = Object.entries(map)
            .sort(([a], [b]) => parseFloat(a) - parseFloat(b))
            .map(([k, v]) => {
                const e = {
                    k: parseFloat(k),
                    w
                }
                w += v
                return e
            })

        if (bp.length < 1) {
            boxes.push(el)
            continue
        }

        const ent = bp.map(({ k }) => {
            const e1 = Math.pow(entropy(el!.data.filter(v => v.rgb[i] < k)), 3)
            const e2 = Math.pow(entropy(el!.data.filter(v => v.rgb[i] >= k)), 3)
            if (e1 == 0 || e2 == 0)
                return { k, e: Number.MAX_VALUE }
            else
                return { k, e: e1 + e2 }
        })

        // const mid = w / 2
        let min = ent[0]
        ent.forEach(e => {
            if (e.e < min.e)
                min = e
        })

        const p = min.k

        // const p = el.mid[i]
        const low = new Entry(el.data.filter(v => v.rgb[i] < p))
        const high = new Entry(el.data.filter(v => v.rgb[i] >= p))
        if (low?.data.length && high?.data.length) {
            queue.push(low)
            queue.push(high)
        } else {
            boxes.push(el)
        }
    }

    boxes.sort((a, b) => b.weight - a.weight)

    console.log(boxes)
    console.log(`Took ${(new Date().getTime() - start) / 1000}s`)
    return boxes
}

import { ColorTupple } from './color'

export type Box = Array<{ rgb: ColorTupple, w: number }>

export function entropy(box: Box) {
    const { m, w } = mean(box)
    if (w == 0)
        return {
            entropy: 0,
            weight: 0,
            mean: [0, 0, 0] as ColorTupple
        }
    const w2 = box.reduce((t, v) => t + v.w * v.w, 0)
    const err = box.reduce((t, v) => t + euc2(m, v.rgb) * v.w * v.w, 0) / w2
    return {
        entropy: err,
        weight: w,
        mean: m
    }
}

export function euc2(a: ColorTupple, b: ColorTupple) {
    return a.reduce((t, v, i) => t + (v - b[i]) * (v - b[i]), 0)
}

export function mean(box: Box) {
    let w = 0
    const m = box
        .reduce((t, v) => {
            w += v.w
            v.rgb.forEach((p, i) => t[i] += p * v.w)
            return t
        }, [0, 0, 0] as ColorTupple)
        .map(v => v / w) as ColorTupple
    return {
        m,
        w
    }
}

export function median(data: Box, i: number, target = data.length / 2, d = 0): number {
    if (d > 50)
        throw new Error('Max')
    if (target > data.length - 1)
        return data.reduce((t, v) => t + v.rgb[i], 0) / data.length
    if (data.length < 10) {
        data = data.sort((a, b) => a.rgb[i] - b.rgb[i])
        if (Number.isInteger(target))
            return data[target].rgb[i]
        return data[Math.floor(target)].rgb[i] * (target - Math.floor(target)) + data[Math.ceil(target)].rgb[i] * (Math.ceil(target) - target)
    }
    const p = (
        data.reduce((t, v) => t > v.rgb[i] ? t : v.rgb[i], Number.MIN_VALUE) +
        data.reduce((t, v) => v.rgb[i] < t ? v.rgb[i] : t, Number.MAX_VALUE)
    ) / 2
    const u = data.filter(v => v.rgb[i] <= p)
    if (u.length == 0 || u.length == data.length) {
        if (Number.isInteger(target))
            return data[target].rgb[i]
        return data[Math.floor(target)].rgb[i] * (target - Math.floor(target)) + data[Math.ceil(target)].rgb[i] * (Math.ceil(target) - target)
    }
    if (u.length > target)
        return median(u, i, target, d + 1)
    else
        return median(data.filter(v => v.rgb[i] > p), i, target - u.length, d + 1)
}

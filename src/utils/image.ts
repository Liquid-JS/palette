export function createCanvas(width: number, height: number) {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    return canvas
}

export function baseLength(val: number | SVGAnimatedLength) {
    if (typeof val == 'object') {
        val.baseVal.convertToSpecifiedUnits(val.baseVal.SVG_LENGTHTYPE_PX)
        return val.baseVal.value
    }
    return val
}

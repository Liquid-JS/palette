function createCanvas(width: number, height: number) {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    return canvas
}

function baseLength(val: number | SVGAnimatedLength) {
    if (typeof val == 'object') {
        val.baseVal.convertToSpecifiedUnits(val.baseVal.SVG_LENGTHTYPE_PX)
        return val.baseVal.value
    }
    return val
}

export type ImageDataTuple = [number, number, Uint8ClampedArray]

/**
 * Extract pixel data from image
 *
 * @param img Image source
 * @returns Tuple containing image width, height, and pixel data
 */
export function extractImageData(img: Exclude<CanvasImageSource, VideoFrame>) {
    const swidth = baseLength(img.width)
    const sheight = baseLength(img.height)

    const width = swidth
    const height = sheight

    const canvas = img instanceof HTMLCanvasElement
        ? img
        : createCanvas(width, height)

    const ctx = canvas.getContext('2d')
    if (!ctx)
        throw new Error('Unable to obtain canvas context')

    if (canvas !== img)
        ctx.drawImage(img, 0, 0)

    const data = ctx.getImageData(0, 0, width, height)
    return [width, height, data.data] as ImageDataTuple
}

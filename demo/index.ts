import { extractImageData, quantize } from '../src'
import { rgb2str } from '../src/utils/color'
import samplePath from './logos.png'

const img = new Image()
img.addEventListener('load', () => {
    const start = new Date().getTime()
    const imageData = extractImageData(img)
    const colors = quantize(imageData)
    console.log(`Took ${(new Date().getTime() - start) / 1000}s`)
    console.log(colors)

    img.style.maxWidth = '32em'
    img.style.height = 'auto'
    img.style.boxShadow = '0 0 1em rgba(0, 0, 0, 0.5)'
    img.style.margin = '0.5em'
    img.style.display = 'block'
    document.body.appendChild(img)

    const container = document.createElement('div')
    container.style.boxShadow = '0 0 1em rgba(0, 0, 0, 0.5)'
    container.style.margin = '0.5em'
    container.style.display = 'inline-flex'
    document.body.appendChild(container)

    colors
        .map(b => b.qRgb)
        .map(rgb2str)
        .forEach(c => {
            const div = document.createElement('div')
            div.style.width = '1em'
            div.style.height = '1em'
            div.style.display = 'inline-block'
            div.style.background = c
            container.appendChild(div)
        })
})
img.src = samplePath

import { quantize } from '../src'
import { rgb2str } from '../src/utils/color'
import { mean } from '../src/utils/operations'
import samplePath from './sample2.png'

const img = new Image()
img.addEventListener('load', () => {
    document.body.appendChild(img)
    const colors = quantize(img)
        .map(b => mean(b.data).m)
        // .map((m) => lab2rgb(m))
        .map(rgb2str)
    colors.forEach(c => {
        const div = document.createElement('div')
        div.style.width = '15px'
        div.style.height = '15px'
        div.style.display = 'inline-block'
        div.style.background = c
        document.body.appendChild(div)
    })
})
img.src = samplePath

# Palette

[![GitHub license](https://img.shields.io/github/license/Liquid-JS/palette.svg)](https://github.com/Liquid-JS/palette/blob/master/LICENSE)
[![npm](https://img.shields.io/npm/dm/@liquid-js/palette.svg)](https://www.npmjs.com/package/@liquid-js/palette)
[![scope](https://img.shields.io/npm/v/@liquid-js/palette.svg)](https://www.npmjs.com/package/@liquid-js/palette)

Get colour palette from an image.

## Installation

    npm install @liquid-js/palette

## API Documentation

<https://liquid-js.github.io/palette/>

## Usage

To obtain colours from an image, use `extractImageData` and `quantize` (note: `quantize` might take a long time to run depending on image size; consider running it asynchronously).

```ts
import { extractImageData, quantize } from '@liquid-js/palette'

const imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Peace_Of_Nature_%28129019177%29.jpeg/640px-Peace_Of_Nature_%28129019177%29.jpeg'

const img = new Image()
img.crossOrigin = 'anonymous'
img.addEventListener('load', () => {
    const imageData = extractImageData(img)
    const colors = quantize(imageData)

    console.log(colors)
})
img.src = imageUrl
```

## License

[MIT License](https://github.com/Liquid-JS/palette/blob/master/LICENSE)

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

To configure that only workspace-packages are accepted scopes:

```ts
import { extractImageData, quantize } from '../index'

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

To configure that workspace-packages and `codeowners` are accepted scopes:

```json
{
    "plugins": [
        "@liquid-js/palette"
    ],
    "rules": {
        "scope-enum": [
            2,
            "always",
            {
                "extra": [
                    "codeowners"
                ]
            }
        ]
    }
}
```

To strip namespace prefix from workspace packages:

```json
{
    "plugins": [
        "@liquid-js/palette"
    ],
    "rules": {
        "scope-enum": [
            2,
            "always",
            {
                "stripPrefix": [
                    "@my-org/"
                ]
            }
        ]
    }
}
```

## Examples

    $ cat .commitlintrc.json

    {
        "extends": [
            "@commitlint/config-conventional"
        ],
        "plugins": [
            "@liquid-js/palette"
        ],
        "rules": {
            "scope-enum": [
                2,
                "always",
                [
                    "codeowners"
                ]
            ]
        }
    }

    $ tree packages

    packages
    ├── api
    ├── app
    └── web

    $ echo "feat(api): this will succeed" | npx commitlint --verbose
    ⧗   input: feat(api): this will succeed
    ✔   found 0 problems, 0 warnings

    $ echo "feat(codeowners): this will succeed" | npx commitlint --verbose
    ⧗   input: feat(codeowners): this will succeed
    ✔   found 0 problems, 0 warnings

    $ echo "feat(foo): this will fail" | npx commitlint --verbose
    ⧗   input: feat(foo): this will fail
    ✖   scope must be one of [api, app, web] [scope-enum]
    ✖   found 1 problems, 0 warnings

## License

[MIT License](https://github.com/Liquid-JS/palette/blob/master/LICENSE)

# janczura.dev

Personal portfolio website of **Sergiusz Jańczura** — Java Developer based in Poznań, Poland.

Live at: [https://janczura.dev](https://janczura.dev)

---

## About

A single-page portfolio built with vanilla HTML, CSS, and JavaScript. Features a Chinese-inspired dark aesthetic with animated background elements.

## Features

- Animated canvas dragons following Lissajous paths with spines, claws, whiskers
- Falling plum-blossom petals (梅花)
- Bamboo groves on both sides of the viewport
- Stroke-by-stroke Chinese calligraphy animation — characters are drawn and erased one stroke at a time
- CSS Chinese lanterns (灯笼) hanging on the sides
- Randomised CSS fireworks beside the header dragons
- Responsive layout, smooth scroll, fade-in sections

## Structure

```
janczura.dev/
├── index.html          # Main page
├── css/
│   └── style.css       # All styles and animations
├── fonts/
│   └── gta.ttf
├── img/
│   ├── foto.jpg
│   └── icon.jpg
└── arcraiders/         # Side projects (Arc Raiders tools)
    ├── talents/
    ├── market/
    └── trials/
```

## Calligraphy configuration

The animated calligraphy characters are configurable at the top of the inline script in `index.html`:

```js
var CHARS = ['天','月','年','是','爱','钱','人','水','火','山','木','日','大', ...];
var SIZE           = 160;   // px  — rendered size
var PAUSE_MS       = 1000;  // ms  — visible after fully drawn
var ERASE_STEP_MS  = 160;   // ms  — delay between erasing each stroke
var SPAWN_EVERY_MS = 4500;  // ms  — interval between new characters
```

---

## Third-party licenses

### Hanzi Writer

This project uses **Hanzi Writer**, licensed under the MIT License.

> Copyright (c) 2016 Dave Rupert
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all
> copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
> SOFTWARE.

Source: [https://github.com/chanind/hanzi-writer](https://github.com/chanind/hanzi-writer)

Character data is sourced from the **Hanzi Writer Data** package, which is derived from [Make Me a Hanzi](https://github.com/skishore/makemeahanzi), also MIT licensed.

# @figit/dom-to-figma API (quick reference)

Upstream: https://github.com/figitdesign/web-to-figma

## Install

```sh
cd tools/html-to-figma
npm install
```

Package: `@figit/dom-to-figma@0.2.4`

## Convert one element

```js
import { createFigmaConverter, createFontsourceLoader } from "@figit/dom-to-figma";
// or: https://esm.sh/@figit/dom-to-figma@0.2.4

const figma = createFigmaConverter({
  layout: "auto", // default: native auto-layout when geometry matches
  fontLoader: createFontsourceLoader({ subset: "latin" }),
});

const result = await figma.convert({
  element: document.body,
  width: 1440,
  height: 900,
  name: "Hero",
});

await navigator.clipboard.write([result.toClipboardItem()]);
```

## Multi-frame canvas

```js
const result = await figma.convert({
  frames: [
    { element: a, width: 1440, height: h1, x: 0, y: 0, name: "00 Welcome" },
    { element: b, width: 1440, height: h2, x: 1600, y: 0, name: "01 Invitation" },
  ],
  canvasName: "Agent Onboarding",
});
```

## Options

| Option | Purpose |
|--------|---------|
| `layout: "auto"` | Infer Figma auto-layout from flex/block/wrap/grid |
| `layout: "absolute"` | Absolute positioning fallback |
| `fontLoader` | Default Fontsource CDN loader |
| `imageLoader` | Default direct fetch; use proxy for CORS |
| `classify` | Override DOM -> node kind mapping |
| `trace: true` | Map emitted nodes back to DOM paths |

## Result

- `toClipboardItem()` - paste into Figma
- `toClipboardHtml()` - raw HTML envelope
- `base64` / `bytes` - encoded payload
- `trace` - only when `trace: true`

## Runtime

Browser only. Needs `getComputedStyle`, `ClipboardItem`, fonts ready, CORS-reachable images/fonts.

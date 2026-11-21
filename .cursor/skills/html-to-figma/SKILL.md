---
name: html-to-figma
description: >-
  Convert live HTML pages into editable Figma layers with @figit/dom-to-figma
  (web-to-figma). Use when the user asks to convert HTML to Figma, paste screens
  into Figma, run html-to-figma / web-to-figma / dom-to-figma, or capture
  EnrollAxis / shadcn HTML screens for design. Prefer this over approximate
  use_figma rebuilds when pixel fidelity is required.
disable-model-invocation: false
---

# HTML to Figma (Figit / web-to-figma)

Source: [figitdesign/web-to-figma](https://github.com/figitdesign/web-to-figma) via `@figit/dom-to-figma@0.2.4`.

Local install: `tools/html-to-figma/` (run `npm install` there if needed).
Helper UI: `tools/html-to-figma/convert.html`.

## Accuracy mandate (verbatim)

Respect the images, icons, button height width, fonts, aspect ratios and the shadcn components with 100% accuracy.

Do not invent alternate spacing, restyle buttons, swap icon sets, crop logos, or approximate typography. Convert the rendered DOM as-is.

## When to use

- User wants HTML / localhost screens in Figma as editable layers
- Onboarding, portal, or other EnrollAxis static HTML screens
- Need native auto-layout from real flex/grid, not hand-drawn boxes

Prefer this path for EnrollAxis shadcn HTML fidelity. For **Enroll-NFP** (Font Awesome /
Bootstrap CDN) screens, use the `nfp-to-figma` skill (Figma MCP capture + headless
Chrome) instead of Figit or hand rebuilds.

Use Figma MCP `use_figma` only for cleanup that cannot come from the DOM paste.

## Desktop default

- Capture width: **1440px** unless the user asks otherwise
- Height: measure from the live DOM (`scrollHeight` / bounding box), do not invent a short artboard
- One Figma frame per screen / step state

## Workflow

1. Serve the target branch/worktree over localhost (example: `python -m http.server 8791`).
2. Open the screen at the required state (welcome, step N, etc.).
3. Force desktop width to 1440 before convert:
   - set viewport / layout to desktop
   - ensure `.ui-shell` / page is not mobile-collapsed
4. Run converter via `tools/html-to-figma/convert.html` inject snippet, or import:

```js
import { createFigmaConverter, createFontsourceLoader } from "https://esm.sh/@figit/dom-to-figma@0.2.4";

const width = 1440;
const root = document.querySelector("body");
document.documentElement.style.width = width + "px";
document.body.style.width = width + "px";
await document.fonts.ready;

const height = Math.ceil(Math.max(
  root.getBoundingClientRect().height,
  root.scrollHeight,
  document.documentElement.scrollHeight
));

const figma = createFigmaConverter({
  layout: "auto",
  fontLoader: createFontsourceLoader({ subset: "latin" }),
});

const result = await figma.convert({
  element: root,
  width,
  height,
  name: "Screen Name / Desktop",
});

await navigator.clipboard.write([result.toClipboardItem()]);
```

5. Paste into the target Figma file with Ctrl+V.
6. Repeat per onboarding step / page. For multi-frame canvases, use `frames: [...]` from the package API when capturing several states in one paste.

## EnrollAxis / shadcn rules

- Fonts: **Poppins** headings, **Inter** body (already loaded by screens / `shadcn-ui.css`)
- Keep `ui-btn`, `ui-input`, `ui-select`, `ui-card`, `ui-label`, badges, chips at measured sizes
- Keep brand teal `#177E71` and existing tokens; do not retheme
- Preserve logo / icon aspect ratios; do not stretch SVGs or raster logos
- Convert only the requested flow pages (for agent onboarding: Welcome + Steps 1-8)

## Do not

- Rebuild screens from scratch in Figma when a live DOM convert is possible
- Change button min-height, padding, or radius during conversion
- Replace icons with emoji or approximate vectors
- Use width below 1440 for "desktop" artboards unless asked
- Commit temporary inject scripts into product HTML; keep helpers under `tools/html-to-figma/`

## Reference

- Package API details: [reference.md](reference.md)
- Upstream README: https://github.com/figitdesign/web-to-figma

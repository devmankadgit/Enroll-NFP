# EnrollAxis HTML to Figma

Uses [`@figit/dom-to-figma`](https://github.com/figitdesign/web-to-figma) (`0.2.4`) to convert live HTML into editable Figma layers via clipboard paste.

## Install

Already installed in this folder:

```sh
npm install
```

## Convert a screen

1. Serve the target HTML (example from onboarding worktree):

```sh
python -m http.server 8791
```

2. Open the helper:

```text
http://127.0.0.1:8791/../  (or open tools/html-to-figma/convert.html from a static server rooted at the repo)
```

Or open `tools/html-to-figma/convert.html` while the page under conversion is on localhost.

3. Set:
   - Page URL
   - Frame name
   - Width `1440` (desktop)
   - Selector (`body` or a shell root)

4. Open the page, copy the inject snippet, run it in that page's DevTools console.

5. Paste into Figma with `Ctrl+V`.

## Accuracy rules

Respect images, icons, button height/width, fonts, aspect ratios, and shadcn components with 100% accuracy. Do not restyle or approximate controls when converting.

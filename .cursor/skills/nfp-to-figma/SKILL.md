---
name: nfp-to-figma
description: >-
  Capture Enroll-NFP HTML prototype screens into Figma with pixel-perfect icons,
  fonts, and layout via Figma MCP generate_figma_design + headless Chrome.
  Use when the user asks for NFP to Figma, Enroll-NFP capture, prototype to
  Figma, or pixel-perfect HTML screens with Font Awesome icons. Prefer this
  over rebuilding with use_figma or the html-to-figma / Figit clipboard path.
disable-model-invocation: false
---

# NFP to Figma (capture, never rebuild)

Pixel-perfect path for **Enroll-NFP** HTML into Figma. Real page rendered in
headless Chrome; Figma MCP `capture.js` sends the live DOM. Icons, web fonts,
and SVGs match the browser.

Tools: `tools/nfp-figma-capture/` (`serve.py`, `open_captures.py`, full README).
Rule: `.cursor/rules/nfp-to-figma.mdc`.
Figma file: https://www.figma.com/design/OH54yXEIQt5vwYEF6wfFQS
File key: `OH54yXEIQt5vwYEF6wfFQS`

Ask before writing to Figma.

## Accuracy mandate

Capture the rendered page as-is. Do not invent spacing, restyle controls, swap
icon sets, or approximate typography.

## Hard rules

- NEVER rebuild a screen by hand with `use_figma` (frames, text, shapes, icons).
  ALWAYS capture with `generate_figma_design` + `open_captures.py`.
- NEVER open capture URLs in a normal browser tab (background tabs pause JS;
  capture stays pending). Use headless Chrome via `open_captures.py`.
- NEVER edit NFP source to capture a state. Use `?run=<js>` or query params.
  Temporary copies (e.g. strip auto-redirect) must be deleted afterwards.
- No emojis and no em dashes in Figma text. Use a plain hyphen (`-`).
- Starter plan: batch MCP work. One `use_figma` script per section, one poll
  per capture after `open_captures.py` prints `done`.

## When to use which path

| Need | Path |
|---|---|
| Enroll-NFP / Font Awesome / Bootstrap CDN screens | **This skill** (capture) |
| EnrollAxis shadcn static HTML clipboard paste | `html-to-figma` (Figit) |
| Annotation Kit layout / labels after capture | `use_figma` only for kit, not rebuild |

## Prerequisites

- Python 3 and Google Chrome (`CHROME_PATH` if not default).
- Figma MCP connected (`whoami` works).
- Local Enroll-NFP checkout (or worktree) path known. Example:
  `git worktree add ../nfp-landing origin/landing-dashboard`

## Workflow

### 1. Start the inject server

```bash
py tools/nfp-figma-capture/serve.py <path-to-nfp> 8090
```

Leave it running. Confirm e.g. `http://localhost:8090/portal/sso-login.html`.
`serve.py` injects Figma `capture.js` and optional `?run=` JS; NFP files are
never modified.

### 2. List screens

Table: Code | Screen name | page path + query | `run` JS.

### 3. One capture ID per screen

Call Figma MCP `generate_figma_design` once per screen with:

- `fileKey`: `OH54yXEIQt5vwYEF6wfFQS`
- `nodeId`: target **page** id (e.g. `30:4`)

Save each returned `captureId`.

### 4. Run headless captures

```bash
py tools/nfp-figma-capture/open_captures.py ^
  "portal/sso-login.html?run=document.title='SSO-01'|<captureId1>" ^
  "portal/signing-in.html?fail=1&run=document.title='SSO-02.1'|<captureId2>"
```

Rules:

- Arg format: `"<page path with query>|<captureId>"`
- Always set `document.title='CODE'` in `run` (frame name = page title)
- Multiple actions: join with `;`
- `run` fires 300 ms after load, then scroll top; capture after `figmadelay`
  (default 3000 ms). Icons empty? `CAPTURE_DELAY_MS=5000`
- Env: `CAPTURE_PORT`, `CAPTURE_WAIT_S`, `CHROME_PATH`

### 5. Poll once

After script prints `done`, call `generate_figma_design` with each `captureId`
once to confirm completion.

### 6. Organise with Annotation Kit (`use_figma`)

Use existing components on page "Annotation Kit". Do not create new ones.

| Component | Node | Text props |
|---|---|---|
| Flow Header | `30:28` | Eyebrow, Title, Description, Meta |
| Screen Label | `30:19` | Code, Title, Source (hide Source) |
| Note | `30:33` | Heading ("What this screen does"), Body |
| Flow Arrow | `30:36` | none |
| Status Pill set | `30:18` | NFP Reference / In Design / Ready for Dev / Approved |

Layout (match existing sections):

- One Section per step, fill `#CDD2DA`, padding 120, Flow Header at top
- Frames 1440 wide, 200 px gap, Flow Arrow centred in gap
- First row top = header bottom + 120
- Screen Label 72 px above frame; Note 32 px below
- Frame name: `CODE · Screen name`
- Brand: primary `#147966`, light `#E8F2F1`

### 7. Verify

`get_screenshot` each new section; compare icons and fonts to the browser.

## Known NFP `run` triggers

| Page | JS / query | Shows |
|---|---|---|
| `agent/onboarding.html` | `obGoTo(n)` | wizard step n (0-7) |
| `agent/onboarding.html` | `openSegmentScreen(i)` | segment screen i |
| `agent/onboarding.html` | `prefillStep(n)` | step n with sample data |
| `portal/landing-carrier.html` | `[data-group=KEY].click()` | sidebar accordion |
| `portal/landing-carrier.html` | `#sidebarRail.click()` | sidebar collapsed |
| `portal/landing-carrier.html` | `?state=loading` / `?state=error` | loading / error |
| `portal/signing-in.html` | `?fail=1` | sign-in failed (auto-redirect 1.4 s - capture from temp copy without redirect, then delete) |
| `portal/select-carrier.html` | `?noaccess=1` | no access |

Sidebar KEY values: agent-producer, members-leads, commissions-finance,
training-compliance, support-ops, sales-campaigns, enrollment-ops, system-config.

## Troubleshooting

| Problem | Fix |
|---|---|
| Capture pending forever | Used normal browser tab. Use `open_captures.py`. |
| Icons empty boxes | Raise delay: `CAPTURE_DELAY_MS=5000` |
| Icons wrong vs browser | Agent rebuilt instead of capture. Delete and recapture. |
| Wrong state | Test `run` JS in browser console on localhost:8090 first. |
| Wrong Figma page | `nodeId` must be the page id. |
| Port in use | Other port + `CAPTURE_PORT=...` |
| MCP limit | Batch; wait for reset; prefer Dev Team / Pro seat when possible. |

## Reference

Full handoff guide: [tools/nfp-figma-capture/README.md](../../../tools/nfp-figma-capture/README.md)

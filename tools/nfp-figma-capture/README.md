# NFP to Figma: pixel-perfect capture

How we put NFP (Enroll-NFP HTML prototype) screens into Figma so icons, fonts and
layout come out exactly like the browser. Works the same in Cursor or Claude Code.

Figma file: https://www.figma.com/design/OH54yXEIQt5vwYEF6wfFQS

---

## 1. Why icons break today

There are two ways an AI agent can put a screen into Figma:

| Approach | What happens | Result |
|---|---|---|
| **Rebuild** (agent reads HTML, then draws frames/text/shapes with `use_figma`) | The agent guesses each element. Font Awesome icons are font glyphs, so the agent swaps in its own shapes or skips them. | Icons wrong or missing, spacing off |
| **Capture** (real page rendered in Chrome, Figma's `capture.js` sends the live DOM to Figma) | Figma gets the real rendered page, including icon glyphs, SVGs, web fonts and images. | Same as the browser |

We always use **Capture**. Never let the agent rebuild a screen by hand.

Two more things also break captures:

1. **Normal browser tab.** Background tabs pause JavaScript, so the capture stays
   "pending" forever. Fix: headless Chrome (`open_captures.py`).
2. **Capturing too early.** NFP loads Font Awesome 6.4.2, Poppins/Inter and Bootstrap
   from CDNs. If capture fires before they load, icons show as empty boxes. Fix:
   `figmadelay=3000` (3 seconds wait). Raise it with `CAPTURE_DELAY_MS=5000` if needed.

---

## 2. What is in this folder

| File | Purpose |
|---|---|
| `serve.py` | Local web server for the NFP folder. Injects Figma's `capture.js` into every HTML page on the fly (NFP files are never changed). Also supports `?run=<js>` to open a wizard step, accordion or hidden state before capture. |
| `open_captures.py` | Opens each page in its own headless Chrome (1440 x 900) with the Figma capture hash, in parallel. |
| `.cursor/rules/nfp-to-figma.mdc` | Cursor rule. Tells the Cursor agent to follow this exact workflow. |

---

## 3. One-time setup

Already installed in this EnrollAxis workspace:

| Piece | Location |
|---|---|
| Capture tools | `tools/nfp-figma-capture/` (`serve.py`, `open_captures.py`) |
| Cursor rule | `.cursor/rules/nfp-to-figma.mdc` |
| Agent skill | `.cursor/skills/nfp-to-figma/` (also in personal Agent Store) |

Still required on the machine:

1. **Python 3** and **Google Chrome** installed. If Chrome is not in the default place,
   set `CHROME_PATH` to its full path.
2. **Figma MCP in Cursor.** Cursor Settings > MCP > Add new MCP server:
   ```json
   {
     "mcpServers": {
       "figma": { "url": "https://mcp.figma.com/mcp" }
     }
   }
   ```
   Then click Connect and log in with the Figma account that has edit access to the file.
   Check: ask the agent to call `whoami`.
3. **NFP repo** cloned locally (`devmankadgit/Enroll-NFP`), on the branch you want to capture.
   Tip: use a worktree per branch so your main checkout stays clean:
   ```bash
   git fetch origin
   git worktree add ../nfp-landing origin/landing-dashboard
   ```
   Then serve that folder:
   ```bash
   py tools/nfp-figma-capture/serve.py E:\path\to\nfp-landing 8090
   ```

---

## 4. Workflow (per flow)

### Step 1: start the server
```bash
py tools/nfp-figma-capture/serve.py /path/to/nfp-landing 8090
```
Leave it running. Check one page opens: http://localhost:8090/portal/sso-login.html

### Step 2: list the screens
Write down every screen, its code and how to reach it. Example (SSO flow):

| Code | Page |
|---|---|
| SSO-01 | `portal/sso-login.html` |
| SSO-02.1 | `portal/signing-in.html?fail=1` |
| SSO-05.1 | `portal/landing-carrier.html?state=loading` |
| SSO-06 | `portal/landing-carrier.html?run=document.querySelector('[data-group=agent-producer]').click()` |
| SSO-06.2 | `portal/landing-carrier.html?run=document.getElementById('sidebarRail').click()` |

### Step 3: get one capture ID per screen
Ask the agent to call Figma MCP `generate_figma_design` once per screen with:
- `fileKey`: `OH54yXEIQt5vwYEF6wfFQS`
- `nodeId`: the ID of the **page** the frames should land on (e.g. `30:4`)

Each call returns a `captureId`.

### Step 4: run the captures
```bash
py tools/nfp-figma-capture/open_captures.py \
  "portal/sso-login.html?run=document.title='SSO-01'|<captureId1>" \
  "portal/signing-in.html?fail=1&run=document.title='SSO-02.1'|<captureId2>"
```
Rules for the argument:
- Format is `"<page path with query>|<captureId>"`.
- Always add `document.title='CODE'` in `run`. The Figma frame takes the page title as
  its name, so you can find each frame by code afterwards.
- More than one action: join with `;`, e.g.
  `run=document.title='SSO-06';document.querySelector('[data-group=agent-producer]').click()`
- Run is executed 300 ms after page load, then scrolls to top. Capture fires after
  `figmadelay` (3 s), so the UI has time to settle.
- If the shell complains about quotes, wrap the whole argument in double quotes and use
  single quotes inside (as above). On Windows use `py` (already shown above).

### Step 5: poll
Ask the agent to call `generate_figma_design` again with each `captureId` to check it
finished. One poll is usually enough after the script prints `done`.

### Step 6: organise in Figma (with `use_figma`)
Use the existing Annotation Kit components on page "Annotation Kit". Do not create new ones.

| Component | Node | Text props |
|---|---|---|
| Flow Header | `30:28` | Eyebrow, Title, Description, Meta |
| Screen Label | `30:19` | Code, Title, Source (hide Source line) |
| Note | `30:33` | Heading ("What this screen does"), Body |
| Flow Arrow | `30:36` | none |
| Status Pill set | `30:18` | NFP Reference / In Design / Ready for Dev / Approved |

Layout (keep it identical to existing sections):
- One Section per step (e.g. `03-D · Sidebar Navigation States`), fill `#CDD2DA`,
  padding 120, Flow Header at top.
- Frames 1440 wide, 200 px gap, Flow Arrow centred in the gap.
- First row top = header bottom + 120.
- Screen Label 72 px above its frame (so it does not collide with Figma's frame name).
- Note 32 px below its frame.
- Frame name: `CODE · Screen name` (e.g. `SSO-06.2 · Sidebar Collapsed (Icons Only)`).
- Brand green for pills/code badge: primary `#147966`, light `#E8F2F1`.
- No emojis, no em dashes in Figma text.

### Step 7: check
Ask the agent for `get_screenshot` of each new section and compare against the browser.

---

## 5. Useful NFP triggers for `run`

| Page | JS | Shows |
|---|---|---|
| `agent/onboarding.html` | `obGoTo(n)` | wizard step n (0-7) |
| `agent/onboarding.html` | `openSegmentScreen(i)` | segment screen i |
| `agent/onboarding.html` | `prefillStep(n)` | step n with sample data |
| `portal/landing-carrier.html` | `document.querySelector('[data-group=KEY]').click()` | open sidebar accordion. KEY: agent-producer, members-leads, commissions-finance, training-compliance, support-ops, sales-campaigns, enrollment-ops, system-config |
| `portal/landing-carrier.html` | `document.getElementById('sidebarRail').click()` | sidebar collapsed, icons only |
| `portal/landing-carrier.html` | `?state=loading` / `?state=error` | loading skeleton / error with Retry |
| `portal/signing-in.html` | `?fail=1` | sign-in failed |
| `portal/select-carrier.html` | `?noaccess=1` | no access state |

`portal/signing-in.html` redirects after 1.4 s, so it leaves before capture. Capture it
from a temporary copy with the redirect removed, then delete the copy.

---

## 6. Troubleshooting

| Problem | Fix |
|---|---|
| Capture stuck on "pending" | You opened it in a normal browser tab. Use `open_captures.py`. |
| Icons are empty boxes | Font Awesome not loaded yet. PowerShell: `$env:CAPTURE_DELAY_MS=5000; py tools/nfp-figma-capture/open_captures.py ...` |
| Icons look different from browser | The agent rebuilt the screen instead of capturing. Delete it and capture again. |
| Wrong state captured | Test the `run` JS first in the browser console at `localhost:8090`. |
| Frame lands on wrong page | `nodeId` in `generate_figma_design` must be the page ID. |
| Port in use | `py tools/nfp-figma-capture/serve.py <dir> 8091` and `$env:CAPTURE_PORT=8091; py tools/nfp-figma-capture/open_captures.py ...` |
| Figma says limit reached | Starter plan has a low monthly MCP call limit and max 3 pages. Wait for reset or move the file to a paid team. Batch work to save calls. |
| Mac/Windows slow, several pages at once | Fewer pages per run, or `CAPTURE_WAIT_S=60`. |

---

## 7. Saving Figma calls (Starter plan)

- One `use_figma` call can do a lot: create section, place frames, labels, notes and
  arrows in one script. Do not do one call per element.
- Poll once, after the script finishes, not repeatedly.
- Use `get_metadata` once to get node IDs, then reuse them.

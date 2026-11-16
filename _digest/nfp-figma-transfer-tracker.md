# NFP Frontend to Figma Transfer - Project Tracker

Last updated: 2026-11-04
Branch (source of truth): `enrollaxis-agent-onboarding-design`
Destination Figma: https://www.figma.com/design/5CWfiFUTK3rw3Rd6r7Zqvt/EnrollAxis
Figma session id (analysis): `e8513736-243f-4ff7-9b5b-ff9601465ac6`
MCP account: preet.badiyani@aaneel.com (seat: View, plan: starter)

## Status legend

- done
- blocked
- pending
- waiting-approval

## Phase status

| Phase | Status | Notes |
| --- | --- | --- |
| 1. Repo + design-system analysis | done | Tokens from `assets/shadcn-ui.css` |
| 2. Locate approved Agent Onboarding | done | `agent/onboarding.html` (not `onboarding-form.html`) |
| 3. Inspect Figma + MCP capabilities | done | Write tools unavailable on current seat/plan |
| 4. Analysis report to team | done | Delivered in Cursor chat 2026-11-04 |
| 5. Pilot transfer (Get started / AOW) | blocked | Needs Full seat + Professional+ plan for `use_figma` |
| 6. Validate pilot vs Cursor HTML | pending | After transfer |
| 7. Remaining-screen transfer plan | pending | Draft inventory ready; refine after pilot |
| 8. Team approval gate | waiting-approval | Do not transfer remaining screens yet |

## Decisions (locked)

1. Latest brand source of truth is the Cursor repo kit (`assets/shadcn-ui.css`), not older NFP Bootstrap/`nfp.css` screens.
2. Primary brand color is `#177E71` (`--primary-500`). Do not use `#002624` as primary.
3. Typography: Poppins headings, Inter body/UI.
4. Approved Agent Onboarding pilot source is `agent/onboarding.html` on `enrollaxis-agent-onboarding-design`.
5. Do not treat `agent/onboarding-form.html` (Bootstrap + `nfp.css`) as the approved flow.
6. Do not overwrite existing Figma frames; add new editable frames beside them.
7. Do not modify frontend HTML/CSS for this transfer work.

## Open blockers

1. **Figma MCP write access:** Connected tools are read-only (`get_metadata`, `get_screenshot`, `get_design_context`, etc.). `use_figma`, `generate_figma_design`, `create_new_file`, and `upload_assets` are not exposed. `whoami` reports seat `View` on `starter`. Writing to canvas requires Professional+ plan and a Full seat with edit access.
2. **Local uncommitted edits:** `agent/onboarding.html` has uncommitted changes (+104 / -50 vs HEAD). Confirm whether pilot should use working tree or last commit `6aaf7dd`.
3. **Existing AOW-02 frame** in destination file appears screenshot/composite based (FireShot capture + logo overlays), not a full editable component tree. Reuse naming; do not overwrite.
4. **No reusable Figma components/variables** returned from design-system search in this file yet (empty button/primary/Poppins results). Color foundation frame exists visually.

## Design tokens (repo)

### Primary teal
- 50 `#E8F2F1` ... 500 `#177E71` ... 950 `#020D0B`
- Semantic `--primary` = `#177E71`

### Secondary lime (logo-derived)
- 50 `#F3F9F0` ... 500 `#89C765` ... 950 `#192811`
- Brand aliases: `--brand-mint` = secondary-400 `#A1D284`, `--brand-aqua` = secondary-300 `#B8DDA3`

### Neutral slate
- 50 `#F3F4F3` ... 900 `#1B1C1C` ... 950 `#0D0E0E`
- `--brand-deep` / `--brand-ink` map to neutral-950 / neutral-900 (text/chrome only, not primary CTA fill)

### Typography / radius / shadow
- `--font-heading`: Poppins
- `--font-body`: Inter
- `--radius`: 0.625rem
- Shadows: `--shadow-sm`, `--shadow`, `--shadow-lg`, `--shadow-xl`

## Agent Onboarding inventory (approved)

Source: `agent/onboarding.html`
Shared kit: `assets/shadcn-ui.css`, `assets/minimal-icons.js`, `assets/ui-select.js`, `assets/ui-calendar.js`, `assets/ui-label.js`
Brand assets: `assets/brand/aaneel-ensure.png`, `assets/brand/aaneel-logo.png`, `assets/brand/enrollaxis-logo.png`

### Journey (single SPA; capture as separate Figma frames)

| Code (proposed) | UI state | DOM |
| --- | --- | --- |
| AOW-00 | Get started / Welcome | `#obWelcome` |
| AOW-01 | Invitation & Registration (+ NPN validate) | `#obStep0` |
| AOW-02 | Personal & Business Info | `#obStep1` |
| AOW-03 | W-9 & Tax / Payment | `#obStep2` |
| AOW-04 | AHIP & License Verification | `#obStep3` |
| AOW-05 | Training & Certification | `#obStep4` |
| AOW-06 | Background Check | `#obStep5` |
| AOW-07 | Contract Execution | `#obStep6` |
| AOW-08 | Ready to Sell (locked until complete) | `#obStep7` |

### Chrome / shared elements to componentize
- Sidebar brand + progress box + step list + powered-by footer
- Topbar (toggle, customer logo, titles, notifications, user menu, product logo/version)
- Mobile sticky progress + step rail (breakpoint ~900px)
- Section cards, form grids, alerts, primary/outline/secondary buttons
- NPN validate control + success/error states
- Dialogs: save & exit, start over
- Consent checkbox panels

### Related but out of pilot scope
- `auth/invite-accept.html`, `auth/agent-registration.html`, `auth/login.html`
- Training exam: `agent/training-exam.html` (legacy Bootstrap)
- Legacy alternate: `agent/onboarding-form.html` (AOF series) - confirm BA before any transfer

## Destination Figma structure (observed)

Page/canvas: `EnrollAxis Design` (`0:1`)
Notable frames:
- `Color foundation · Light theme 1` (`246:2`) - primary/secondary/neutral ramps aligned with repo tokens
- `AOW-02 · Personal & Business Info` (`297:2`) - screenshot/composite style; **content actually shows Step 1 Invitation & Registration**, and sidebar lacks the newer **Get started** welcome rail item. Treat as outdated reference, do not overwrite, do not use as layout source of truth for the pilot.

Older reference file (handoff kit, not destination): https://www.figma.com/design/OH54yXEIQt5vwYEF6wfFQS

## Recommended transfer approach (once unblocked)

1. Upgrade Figma to Professional+ and Full seat; confirm edit access on destination file.
2. Reconnect remote Figma MCP; verify `use_figma` + `upload_assets` appear.
3. Map color foundation to Figma variables from `shadcn-ui.css` (do not invent new hex values).
4. Build reusable components from kit primitives (Button, Input, Select, Alert, Sidebar, Topbar, Step item).
5. Pilot frame: **AOW-00 Get started** at desktop (~1440 or matching shell), then validate against live HTML.
6. After approval, transfer AOW-01..08, then PRE/auth, then other portals in batches.

## Remaining screen batches (high level)

1. Agent Onboarding + auth entry (pilot + PRE)
2. Agent portal day-2 screens (`agent/*` minus onboarding)
3. Agency onboarding + agency-admin
4. Broker-support + compliance
5. Admin
6. Finance + enrollment-ops + sales-leadership
7. Member / carrier auth shells
8. Responsive variants for approved flows only

Approx HTML inventory (excluding Figma kit copy): ~180+ screens across portals.

## Session log

### 2026-11-04 - Analysis only
- Confirmed branch `enrollaxis-agent-onboarding-design`
- Extracted tokens from `assets/shadcn-ui.css`
- Inspected Figma file; color foundation matches teal/lime/slate
- Confirmed MCP write tools missing; View/starter seat blocks canvas write
- No Figma writes performed
- Waiting on team: seat/plan upgrade + approval of pilot source (working tree vs commit) + confirm AOW-00 as first frame

### 2026-11-04 - Retry
- Re-authenticated `user-figma` MCP successfully
- `whoami` still: seat `View`, tier `starter` (`preet.badiyani@aaneel.com`)
- Write tools still absent (`use_figma`, `generate_figma_design`, `create_new_file`, `upload_assets`)
- Transfer still blocked; no Figma mutations performed

### 2026-11-04 - Recheck
- `whoami` unchanged: View / starter on `preet.badiyani's team`
- Write tools still absent
- Still blocked

### 2026-11-05 - Seat upgrade recheck + transfer attempt
- `whoami` now shows TWO plans:
  - `preet.badiyani's team`: View / starter
  - `Dev Team`: **Full / pro** (new)
- Seat blocker cleared for Dev Team
- Cursor `~/.cursor/mcp.json` points at remote `https://mcp.figma.com/mcp`
- Write tools still NOT exposed (`use_figma` call failed: tool not found)
- Likely client/tool-loading issue (restart Cursor, disable desktop MCP conflict, reconnect Figma MCP/plugin)
- No Figma mutations performed

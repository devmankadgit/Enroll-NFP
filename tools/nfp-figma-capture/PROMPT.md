# Cursor prompt: NFP flow to Figma (house style)

Copy the prompt below into Cursor chat (Agent mode). Fill in the 4 lines marked `<...>`.
Keep `serve.py`, `open_captures.py`, `layout_section.js` and `README.md` in the project
so the agent can read them.

---

```
You are a senior UI/UX designer and Figma file organiser. Put an NFP flow into our Figma
file in our exact house style. Follow README.md and .cursor/rules/nfp-to-figma.mdc.

FLOW
- NFP folder / branch: <path to NFP checkout, e.g. ../nfp-landing (branch landing-dashboard)>
- Figma page id: <e.g. 30:4>   (file key OH54yXEIQt5vwYEF6wfFQS)
- Flow number + name: <e.g. 04 · Agent Dashboard>
- Screens (page path, query, any click needed):
  <one per line, e.g. portal/landing-agent.html
                     portal/landing-agent.html?state=loading
                     portal/landing-agent.html + open "Commissions" sidebar group>

HOW TO WORK
1. Read README.md, layout_section.js and the HTML of every screen first. Understand what
   each screen does from the real markup and JS (states, buttons, messages).
2. Plan, then show me this table and WAIT for my OK before touching Figma:
   | Section | Code | Screen title | Page + query + run JS | What this screen does |
   - Group screens into 2 to 4 screens per Section, one Section per user step
     (e.g. "Sign In", "Carrier & Portal Selection", "Landing", "Navigation States").
   - Section names: "<flow no>-A · Step name", "-B", "-C"...
   - Codes: short prefix for the flow + number. Main screen = PREFIX-01, its states =
     PREFIX-01.1, PREFIX-01.2 (loading, error, empty, expanded, collapsed).
   - Each Section also gets: one-line description (what the user achieves in this step)
     and meta "Entry: <first screen> · Exit: <where the user goes next>".
3. Capture (never rebuild screens by hand, icons break):
   - python3 serve.py <nfp folder> 8090 (background)
   - generate_figma_design once per screen with nodeId = page id -> captureId
   - ONE command: python3 open_captures.py "<page>?<query>&run=document.title='CODE';<js>|<captureId>" ...
   - Poll each captureId once.
4. Layout: copy layout_section.js, fill ONLY its CONFIG block from the approved table,
   and run it with use_figma (one call for all sections). Do not change the house style
   part, do not draw your own headers, labels, notes or arrows.
5. get_screenshot of each new section. Check: icons and fonts match the browser, nothing
   overlaps, arrows sit between frames. Fix with one more use_figma call if needed.
6. Report: section names, codes, node ids, and a link with ?node-id=<first section id>.

WRITING STYLE (titles and notes)
- Simple English, short sentences, present tense, from the user's point of view.
- Screen title: 2 to 5 words, Title Case, names the screen or state
  (e.g. "Choose a Carrier", "Sign-in Failed", "Sidebar Collapsed (Icons Only)").
- "What this screen does": 1 to 2 sentences. Say what the user sees, what they can do,
  and where it leads. Example: "The user picks which carrier (payer) to work in, when
  they have access to more than one."
- No emojis. No em dashes (use a comma or a full stop). Use " · " as the separator.

LIMITS
- Figma Starter plan: very few MCP calls per month and max 3 pages. Batch everything,
  never one call per element, never poll more than once. Do not create new pages without
  asking. Do not create new components; use the Annotation Kit (30:28, 30:19, 30:33, 30:36).
```

---

## Example of a finished table (SSO flow, already in Figma)

| Section | Code | Screen title | Page | What this screen does |
|---|---|---|---|---|
| 03-A · SSO Sign In | SSO-01 | SSO Log In | portal/sso-login.html | AaNeel single sign-on login. The user enters username and password. |
| | SSO-02 | Signing In | portal/signing-in.html | Shown while sign-in completes. Moves on to carrier selection. |
| | SSO-02.1 | Sign-in Failed | portal/signing-in.html?fail=1 | Shown when sign-in cannot be completed. The user can try again. |
| 03-B · Carrier & Portal Selection | SSO-03 | Choose a Carrier | portal/select-carrier.html | The user picks which carrier to work in. |
| | SSO-03.1 | No Carrier Access | portal/select-carrier.html?noaccess=1 | No carrier access. The user can sign out and contact their admin. |
| | SSO-04 | Portal Access | portal/select-portal.html | The user picks Agent, Agency Admin, Member or Payer Admin. |
| 03-D · Sidebar Navigation States | SSO-06.2 | Sidebar Collapsed (Icons Only) | landing-carrier.html, run `document.getElementById('sidebarRail').click()` | The sidebar shrinks to icons only, giving content more room. |

## What the house style looks like

```
Page background #B8BEC8
┌─ Section  "03-A · SSO Sign In"  (fill #CDD2DA, padding 120) ───────────────────┐
│  Flow Header: eyebrow / title / description / meta (Entry · Exit · Screens: 3) │
│                                                                                 │
│  [SSO-01  SSO Log In]       [SSO-02  Signing In]      [SSO-02.1 Sign-in Failed] │  <- Screen Label, 72 above
│  ┌──────────────┐    →     ┌──────────────┐    →     ┌──────────────┐           │
│  │ frame 1440w  │  200 gap │              │          │              │           │
│  └──────────────┘          └──────────────┘          └──────────────┘           │
│  What this screen does     What this screen does     What this screen does     │  <- Note, 32 below
└─────────────────────────────────────────────────────────────────────────────────┘
        300 gap, next Section below
```

# EnrollAxis NFP to Figma Kit

Start here. This kit has everything you need to work with the NFP Agent Onboarding screens in Figma and to capture more NFP screens on your own computer.

Figma file: https://www.figma.com/design/OH54yXEIQt5vwYEF6wfFQS

## What is in the kit

| Folder | What it is |
|---|---|
| `01-Handoff` | The full guide. Open `nfp-figma-handoff.html` in any browser and read it first. |
| `02-Claude-or-Cursor-Setup` | Files to connect Figma to Claude Code or Cursor, plus `setup-prompt.txt` to paste into your assistant. |
| `03-Capture-Tools` | The two capture scripts, plus double-click shortcuts to start the NFP preview on Mac or Windows. |
| `04-Figma-Pending-Cleanup` | Changes planned for the Figma file but not applied yet (dark background, no emojis, no long dashes). |
| `05-NFP-Prototype` | The NFP HTML prototype (October 2026 version, 181 pages). Do not edit these files. |

## Quick start

1. **Read the guide:** open `01-Handoff/nfp-figma-handoff.html`.
2. **Install what you need:**
   - Google Chrome.
   - Python 3. On Windows, get it from python.org and tick "Add python.exe to PATH" during install.
   - Claude Code or Cursor.
   - A Figma Professional plan with a Full seat. The free plan allows only about 20 Figma calls a month.
3. **Connect Figma:**
   - Claude Code: follow `02-Claude-or-Cursor-Setup/claude-code-command.txt`.
   - Cursor: Settings, MCP, Add new MCP server, paste `02-Claude-or-Cursor-Setup/cursor-mcp.json`, then click Login.
   - Make sure you log in with the Figma account that has the paid plan.
4. **Check the NFP preview works:** double-click `03-Capture-Tools/start-preview-mac.command` (Mac) or `start-preview-windows.bat` (Windows), then open http://localhost:8090/auth/login.html in Chrome.
5. **Let your assistant do the rest:** open `02-Claude-or-Cursor-Setup/setup-prompt.txt`, fill in the values in angle brackets, and paste it into Claude or Cursor. It will check the connection, find every screen and step in the flow, show you the list, and ask before writing anything to Figma.

## Good to know

- The NFP files are never changed. The preview only adds Figma's capture code while showing the pages.
- On a Mac, the first time you double-click the `.command` file, macOS may block it. Right-click it, choose Open, then Open again.
- Captured screens are a reference of the current NFP, not the new design. Redesign with the AaNeel design system components.
- If the file stays on a free Figma team, it is limited to 3 pages. Move it to your paid team (file name menu, Move to project) to give each flow its own page.

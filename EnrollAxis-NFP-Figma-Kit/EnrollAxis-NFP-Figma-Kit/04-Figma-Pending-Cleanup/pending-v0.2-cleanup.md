# Pending Figma cleanup (v0.2), blocked by the Starter plan MCP limit on 14 Oct 2026

File: https://www.figma.com/design/OH54yXEIQt5vwYEF6wfFQS
Run each block with use_figma once the limit resets or the plan is upgraded.

## 1. Flow page (0:1)
- Page name "01 · Agent Onboarding"; page bg #121212; all sections fill #1E1E1E
- Section "01-A · Pre-Onboarding: Invitation & Registration"
- Frames: 14:2 "AOW-08 · Ready to Sell (Submission Complete)", 25:2 "AOF-10 · Submission Confirmation"
- Instance props:
  - 32:31 Description#30:5 "Primary 8-step producer onboarding, from invitation to Ready to Sell. Left rail shows progress; each step can be saved as draft."
  - 32:89 Body#30:8 "Each training segment opens its own exam screen. See section 01-C."
  - 32:116 Title#30:1 "Ready to Sell (Submission Complete)"
  - 32:177 Description#30:5 "A second, 9-step version of onboarding inside the Agent Portal shell. Overlaps with 01-B, so confirm with BA which flow is final before redesign."
  - 32:202 Body#30:8 "'?' in step headings is an encoding bug in the NFP prototype. It should be a dash."
  - 32:284 Title#30:1 "Submission Confirmation"
  - any other instance TEXT prop: "1–7" -> "1 to 7", remaining em/en dashes -> ", "

## 2. Kit page (30:5)
- Page name "Annotation Kit"; page bg #121212; section 33:124 fill #1E1E1E
- Component 30:19 (Screen Label): text "Title" fill #FFFFFF, text "Source" fill #98A2B3
- Component 30:28 (Flow Header): Meta#30:6 default "Entry: TBD · Exit: TBD · Screens: 0"
- Text 30:38: "Annotation Kit: use instances on flow pages. Do not detach; edit text via component properties." fill #FFFFFF

## 3. Cover & Read Me page (30:4)
- Page name "Cover & Read Me"; page bg #121212
- Cover subtitle: "NFP Prototype Reference · Agent Onboarding"
- Read Me paragraphs: remove emojis from the Pages list and naming examples, replace em dashes with ":" / ";" / "(e.g. ...)", status text without emoji legend, "Steps 1 to 7"
- Change log: add "14 Oct 2026 · v0.2: Removed emojis and em dashes; dark canvas for better contrast with screens."

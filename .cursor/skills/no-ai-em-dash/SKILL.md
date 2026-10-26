---
name: no-ai-em-dash
description: >-
  Never use AI-style em dashes (—) or en dashes (–) in EnrollAxis copy or code.
  Use a plain hyphen (-) instead. Apply whenever writing or editing UI text,
  HTML, CSS comments, JS strings, docs, or commit messages in this project.
---

# No AI em dash

Do not add ( — ) of AI. Remove this thing where it is used and do not use again throughout this flow. Only AI based ( — ). Keep the simple - used in the project.

## Rule

- **Never** write the Unicode em dash `—` (U+2014) or HTML `&mdash;`.
- **Never** write the Unicode en dash `–` (U+2013) or HTML `&ndash;`.
- **Always** use the plain ASCII hyphen-minus `-` (U+002D), matching existing EnrollAxis copy.

## Examples

| Avoid | Use |
|-------|-----|
| `Seg A — Video` | `Seg A - Video` |
| `NPN 8823441 — Onboarding` | `NPN 8823441 - Onboarding` |
| `Oct 15 – Dec 7` | `Oct 15 - Dec 7` |
| `Invitation Sent — Awaiting…` | `Invitation Sent - Awaiting…` |
| Empty placeholder `—` | `-` |

## When editing

Before finishing any UI/copy change, scan the touched files for `—`, `–`, `&mdash;`, and `&ndash;` and replace them with `-`.

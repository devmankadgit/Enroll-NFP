// Figma layout template for captured NFP screens.
// Run with the Figma MCP tool `use_figma` (pass this whole file as the code).
// Only edit the CONFIG block. Everything below it is the fixed house style.
//
// Before running: the screens must already be captured onto the page (see README),
// with frame names starting with their code (we set document.title='CODE' at capture).

// ======================= CONFIG (edit this only) =======================
const CONFIG = {
  pageId: "367:10",
  pageName: "01 · Agent Onboarding",
  eyebrow: "01 · AGENT ONBOARDING",
  sections: [
    {
      name: "01-A · Welcome & Registration",
      description: "The producer opens the invite and registers with a validated NPN.",
      meta: "Entry: Welcome · Exit: Personal & Business Info",
      screens: [
        ["OB-00", "Welcome", "The user sees the invite, what to prepare, and starts onboarding."],
        ["OB-01", "Invitation & Registration", "The user reviews invite details and enters an NPN to continue."],
        ["OB-01.NPN", "NPN Validated", "The NPN check succeeds. The user can move on to personal details."],
      ],
    },
    {
      name: "01-B · Profile, Tax & Payment",
      description: "The producer enters identity, tax, and payout details for contracting.",
      meta: "Entry: Personal Info · Exit: AHIP & License",
      screens: [
        ["OB-02", "Personal & Business Info", "The user enters identity and business address used for contracting."],
        ["OB-03", "W-9 & Tax Payment", "The user uploads a W-9 and chooses ACH for commission payouts."],
        ["OB-03.CHECK", "Physical Check Payment", "Same tax step with Physical Check selected instead of ACH."],
      ],
    },
    {
      name: "01-C · License & Training Hub",
      description: "The producer verifies AHIP and licenses, then opens training from the hub.",
      meta: "Entry: AHIP · Exit: Segment exams",
      screens: [
        ["OB-04", "AHIP & License", "The user adds AHIP and state license details for verification."],
        ["OB-05", "Training Dashboard", "The user sees four training segments and opens one to take its exam."],
        ["OB-05.DONE", "Training Completed", "All segments are done. The user can continue to Background Check."],
      ],
    },
    {
      name: "01-D · Segment Exams",
      description: "Each training segment opens its own exam with material and five questions.",
      meta: "Entry: Seg A · Exit: Exam outcomes or Training hub",
      screens: [
        ["OB-05.A", "Seg A Video Exam", "Video material plus five questions for Segment A."],
        ["OB-05.B", "Seg B Training Exam", "Training excerpt plus five questions for Segment B."],
        ["OB-05.C", "Seg C PDF Exam", "PDF summary plus five questions for Segment C."],
        ["OB-05.D", "Seg D MCQ Exam", "General MCQ exam with five questions for Segment D."],
      ],
    },
    {
      name: "01-E · Exam Outcomes",
      description: "Pass and warning states after submitting a segment exam.",
      meta: "Entry: Submit exam · Exit: Training hub",
      screens: [
        ["OB-05.A-PASS", "Seg A Exam Passed", "Segment A score after a passing submit. The user returns to the hub."],
        ["OB-05.A-WARN", "Unanswered Warning", "Warning when the user submits with missing answers. They can review or submit anyway."],
      ],
    },
    {
      name: "01-F · Background Check",
      description: "The producer consents and sends the background check vendor invitation.",
      meta: "Entry: Background · Exit: Contract Execution",
      screens: [
        ["OB-06", "Background Check", "The user consents and can send the vendor invitation."],
        ["OB-06.SENT", "Background Invite Sent", "Invite is sent. The user sees status and waits on the vendor portal."],
      ],
    },
    {
      name: "01-G · Contract & Ready to Sell",
      description: "The producer signs the contract and reaches submission complete.",
      meta: "Entry: Contract · Exit: Agent dashboard",
      screens: [
        ["OB-07", "Contract Execution", "The user reads the agreement and signs to finish required steps."],
        ["OB-08", "Ready to Sell", "Submission is complete. The user sees case status and goes to the dashboard."],
      ],
    },
  ],
  moveBelowIds: ["444:3"],
};
// ===================== END CONFIG (do not edit below) ====================

// House style (Annotation Kit ids for this EnrollAxis file)
const C = { header: "444:25", label: "444:18", note: "444:30", arrow: "444:33" };
const P = { eyebrow: "Eyebrow#30:3", title: "Title#30:4", desc: "Description#30:5", meta: "Meta#30:6",
            code: "Code#30:0", ltitle: "Title#30:1", source: "Source#30:2", heading: "Heading#30:7", body: "Body#30:8" };
const PAD = 120;
const GAP = 200;
const W = 1440;
const LABEL_GAP = 72;
const NOTE_GAP = 32;
const SECTION_GAP = 300;
const SECTION_FILL = "CDD2DA";
const PAGE_BG = "B8BEC8";

const hex = h => ({ r: parseInt(h.slice(0,2),16)/255, g: parseInt(h.slice(2,4),16)/255, b: parseInt(h.slice(4,6),16)/255 });
const page = await figma.getNodeByIdAsync(CONFIG.pageId);
await figma.setCurrentPageAsync(page);

const codes = CONFIG.sections.flatMap(s => s.screens.map(r => r[0]));
const found = {};
for (const n of page.children) {
  if (n.type !== "FRAME") continue;
  for (const c of codes) if (!found[c] && (n.name === c || n.name.startsWith(c + " ") || n.name.startsWith(c + "|") || n.name.startsWith(c + " ·"))) found[c] = n;
}
const missing = codes.filter(c => !found[c]);
if (missing.length) return { aborted: true, reason: "frames not found on page", missing, topLevel: page.children.map(n => n.name).slice(0, 40) };

const [hdrC, lblC, noteC, arrowC] = await Promise.all([C.header, C.label, C.note, C.arrow].map(id => figma.getNodeByIdAsync(id)));
if (!hdrC || !lblC || !noteC || !arrowC) return { aborted: true, reason: "Annotation Kit components missing", ids: C };
const fonts = new Map();
for (const c of [hdrC, lblC, noteC]) for (const t of c.findAllWithCriteria({ types: ["TEXT"] }))
  for (const f of t.getRangeAllFontNames(0, t.characters.length)) fonts.set(f.family + "|" + f.style, f);
await Promise.all([...fonts.values()].map(f => figma.loadFontAsync(f)));

if (CONFIG.pageName) page.name = CONFIG.pageName;
page.backgrounds = [{ type: "SOLID", color: hex(PAGE_BG) }];

const keep = new Set(CONFIG.moveBelowIds);
const others = page.children.filter(n => !keep.has(n.id) && !Object.values(found).includes(n));
let y = others.length ? Math.max(...others.map(n => n.y + n.height)) + SECTION_GAP : 0;
const x0 = others.length ? Math.min(...others.map(n => n.x)) : 0;

const created = [], sections = [];
for (const s of CONFIG.sections) {
  const sec = figma.createSection();
  sec.name = s.name;
  sec.fills = [{ type: "SOLID", color: hex(SECTION_FILL) }];
  page.appendChild(sec);
  sec.x = x0; sec.y = y;
  created.push(sec.id);

  const hdr = hdrC.createInstance(); sec.appendChild(hdr);
  hdr.setProperties({ [P.eyebrow]: CONFIG.eyebrow, [P.title]: s.name, [P.desc]: s.description,
                      [P.meta]: `${s.meta} · Screens: ${s.screens.length}` });
  hdr.x = PAD; hdr.y = PAD; created.push(hdr.id);

  const rowTop = PAD + hdr.height + 120;
  let x = PAD, rowH = 0;
  s.screens.forEach(([code, title, body], i) => {
    const f = found[code];
    const lbl = lblC.createInstance(); sec.appendChild(lbl);
    lbl.setProperties({ [P.code]: code, [P.ltitle]: title, [P.source]: "" });
    const src = lbl.findOne(n => n.type === "TEXT" && n.name === "Source"); if (src) src.visible = false;
    lbl.x = x; lbl.y = rowTop;

    sec.appendChild(f);
    f.name = `${code} · ${title}`;
    f.x = x; f.y = rowTop + lbl.height + LABEL_GAP;

    const note = noteC.createInstance(); sec.appendChild(note);
    note.setProperties({ [P.heading]: "What this screen does", [P.body]: body });
    note.x = x; note.y = f.y + f.height + NOTE_GAP;
    rowH = Math.max(rowH, note.y + note.height - rowTop);
    created.push(lbl.id, note.id);

    if (i < s.screens.length - 1) {
      const a = arrowC.createInstance(); sec.appendChild(a);
      a.x = x + W + (GAP - a.width) / 2; a.y = f.y + Math.min(400, f.height / 2);
      created.push(a.id);
    }
    x += W + GAP;
  });
  sec.resizeWithoutConstraints(Math.max(x - GAP + PAD, hdr.width + 2 * PAD), rowTop + rowH + PAD);
  sections.push({ id: sec.id, name: sec.name });
  y += sec.height + SECTION_GAP;
}

let cx = x0;
for (const id of CONFIG.moveBelowIds) {
  const n = await figma.getNodeByIdAsync(id);
  if (n) { n.x = cx; n.y = y + 100; cx += n.width + 200; }
}

const leftovers = page.children
  .filter(n => !keep.has(n.id) && !sections.some(s => s.id === n.id))
  .map(n => ({ id: n.id, name: n.name, type: n.type }));

const first = await figma.getNodeByIdAsync(sections[0].id);
await first.screenshot({ scale: 0.15, contentsOnly: false });
return { sections, frames: codes.map(c => ({ code: c, id: found[c].id })), createdNodeIds: created, leftovers };

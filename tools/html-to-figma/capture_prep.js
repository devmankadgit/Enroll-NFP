/**
 * Capture prep for Figit: FA ::before icons -> inline SVG, expand overflow,
 * force 1440 desktop width. Run in page before createFigmaConverter.convert.
 */
export async function prepareForFigit(options = {}) {
  const width = options.width || 1440;
  document.documentElement.style.width = width + "px";
  document.body.style.width = width + "px";
  document.body.style.maxWidth = width + "px";
  window.scrollTo(0, 0);

  try {
    await document.fonts.ready;
    await document.fonts.load('900 16px "Font Awesome 6 Free"');
    await document.fonts.load('400 16px "Font Awesome 6 Free"');
    await document.fonts.load('400 16px "Font Awesome 6 Brands"');
  } catch (_) { /* ignore */ }

  await expandOverflowBoxes(document);
  await faIconsToSvg(document);
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  await new Promise((r) => setTimeout(r, 80));

  const root = options.root || document.body;
  const rect = root.getBoundingClientRect();
  const height = Math.ceil(
    Math.max(rect.height, root.scrollHeight, document.documentElement.scrollHeight, document.body.scrollHeight)
  );
  return { width, height };
}

async function expandOverflowBoxes(root) {
  const candidates = root.querySelectorAll(
    ".contract-scroll, .exam-reading, .ui-page, .ob-section, [class*='scroll']"
  );
  candidates.forEach((el) => {
    const cs = getComputedStyle(el);
    const oy = cs.overflowY;
    if (oy === "auto" || oy === "scroll" || oy === "hidden") {
      const sh = el.scrollHeight;
      if (sh > el.clientHeight + 2) {
        el.style.height = sh + "px";
        el.style.maxHeight = "none";
        el.style.overflow = "visible";
        el.style.overflowY = "visible";
      }
    }
  });
}

const FA_CACHE = new Map();

function faMeta(el) {
  const classes = [...el.classList];
  let style = "solid";
  if (classes.includes("far") || classes.includes("fa-regular")) style = "regular";
  else if (classes.includes("fab") || classes.includes("fa-brands")) style = "brands";
  const skip = new Set([
    "fa", "fas", "far", "fab", "fal", "fad",
    "fa-solid", "fa-regular", "fa-brands", "fa-light", "fa-duotone",
    "fa-fw", "fa-lg", "fa-xl", "fa-2x", "fa-3x", "fa-spin", "fa-pulse",
  ]);
  const nameClass = classes.find((c) => c.startsWith("fa-") && !skip.has(c) && !/^fa-\d/.test(c));
  if (!nameClass) return null;
  return { style, name: nameClass.slice(3) };
}

async function fetchFaSvg(style, name) {
  const key = style + "/" + name;
  if (FA_CACHE.has(key)) return FA_CACHE.get(key);
  const url = `https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.2/svgs/${style}/${name}.svg`;
  const p = fetch(url)
    .then((r) => (r.ok ? r.text() : null))
    .catch(() => null);
  FA_CACHE.set(key, p);
  return p;
}

async function faIconsToSvg(root) {
  const icons = [...root.querySelectorAll("i.fas, i.far, i.fab, i.fa-solid, i.fa-regular, i.fa-brands, i.fa")];
  await Promise.all(
    icons.map(async (el) => {
      const meta = faMeta(el);
      if (!meta) return;
      const svgText = await fetchFaSvg(meta.style, meta.name);
      if (!svgText) return;
      const wrap = document.createElement("span");
      wrap.innerHTML = svgText.trim();
      const svg = wrap.querySelector("svg");
      if (!svg) return;
      const cs = getComputedStyle(el);
      const size = cs.fontSize || "1em";
      const color = cs.color || "currentColor";
      svg.setAttribute("width", size);
      svg.setAttribute("height", size);
      svg.style.width = size;
      svg.style.height = size;
      svg.style.display = "inline-block";
      svg.style.verticalAlign = "-0.125em";
      svg.style.flexShrink = "0";
      svg.style.fill = color;
      svg.setAttribute("aria-hidden", "true");
      svg.querySelectorAll("[fill]").forEach((n) => {
        if (n.getAttribute("fill") !== "none") n.setAttribute("fill", color);
      });
      svg.querySelectorAll("path:not([fill])").forEach((n) => n.setAttribute("fill", color));
      // Preserve margin from FA i
      if (el.getAttribute("style")) {
        const m = /margin[^;]*/i.exec(el.getAttribute("style"));
        if (m) svg.style.cssText += ";" + m[0];
      }
      if (cs.marginRight && cs.marginRight !== "0px") svg.style.marginRight = cs.marginRight;
      el.replaceWith(svg);
    })
  );
}

export async function convertAndSave({ name, file, width = 1440, saveUrl = "http://127.0.0.1:8793/" }) {
  const { createFigmaConverter, createFontsourceLoader } = await import(
    "https://esm.sh/@figit/dom-to-figma@0.2.4"
  );
  const dims = await prepareForFigit({ width });
  const figma = createFigmaConverter({
    layout: "auto",
    fontLoader: createFontsourceLoader({ subset: "latin" }),
  });
  const result = await figma.convert({
    element: document.body,
    width: dims.width,
    height: dims.height,
    name,
  });
  const html = result.toClipboardHtml();
  const res = await fetch(saveUrl, {
    method: "POST",
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Frame-Name": file,
    },
    body: html,
  });
  const saved = await res.json();
  return { name, file, width: dims.width, height: dims.height, bytes: html.length, saved };
}

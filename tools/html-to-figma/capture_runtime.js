/* global window, document, fetch, getComputedStyle */
(function () {
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

  function fetchFaSvg(style, name) {
    const key = style + "/" + name;
    if (FA_CACHE.has(key)) return FA_CACHE.get(key);
    const url = "https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.2/svgs/" + style + "/" + name + ".svg";
    const p = fetch(url).then((r) => (r.ok ? r.text() : null)).catch(() => null);
    FA_CACHE.set(key, p);
    return p;
  }

  async function faIconsToSvg(root) {
    const icons = [...root.querySelectorAll("i.fas, i.far, i.fab, i.fa-solid, i.fa-regular, i.fa-brands, i.fa")];
    await Promise.all(icons.map(async (el) => {
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
      if (cs.marginRight && cs.marginRight !== "0px") svg.style.marginRight = cs.marginRight;
      if (cs.marginLeft && cs.marginLeft !== "0px") svg.style.marginLeft = cs.marginLeft;
      el.replaceWith(svg);
    }));
  }

  function expandOverflowBoxes(root) {
    root.querySelectorAll(".contract-scroll, .exam-reading, [class*='scroll']").forEach((el) => {
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

  function unlockShellHeight() {
    document.documentElement.style.height = "auto";
    document.documentElement.style.minHeight = "0";
    document.body.style.height = "auto";
    document.body.style.minHeight = "0";
    [".ui-shell", ".ui-sidebar", ".ui-main", ".ui-page"].forEach((sel) => {
      const el = document.querySelector(sel);
      if (!el) return;
      el.style.minHeight = "0";
      el.style.height = "auto";
    });
  }

  function measureContentHeight() {
    unlockShellHeight();
    void document.body.offsetHeight;
    const marks = [];
    const pushBottom = (el) => {
      if (!el || el.offsetParent === null && el !== document.body) {
        // still measure active section even if tricky
      }
      if (!el) return;
      const r = el.getBoundingClientRect();
      marks.push(r.bottom + window.scrollY);
      marks.push(el.scrollHeight);
    };
    pushBottom(document.querySelector(".ui-sidebar"));
    pushBottom(document.querySelector(".ui-main"));
    pushBottom(document.querySelector(".ui-page"));
    pushBottom(document.querySelector(".ob-section.active"));
    pushBottom(document.querySelector(".ui-shell"));
    const footer = document.querySelector(".ui-footer, footer");
    pushBottom(footer);
    const h = Math.ceil(Math.max(900, ...marks.filter((n) => Number.isFinite(n))));
    return h;
  }

  async function prepareForFigit(width) {
    width = width || 1440;
    document.documentElement.style.width = width + "px";
    document.body.style.width = width + "px";
    document.body.style.maxWidth = width + "px";
    window.scrollTo(0, 0);
    try {
      await document.fonts.ready;
      await document.fonts.load('900 16px "Font Awesome 6 Free"');
      await document.fonts.load('400 16px "Font Awesome 6 Free"');
    } catch (_) { /* ignore */ }
    expandOverflowBoxes(document);
    await faIconsToSvg(document);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    await new Promise((r) => setTimeout(r, 100));
    const height = measureContentHeight();
    return { width, height };
  }

  async function convertAndSave(opts) {
    const { createFigmaConverter, createFontsourceLoader } = await import(
      "https://esm.sh/@figit/dom-to-figma@0.2.4"
    );
    const dims = await prepareForFigit(opts.width || 1440);
    const figma = createFigmaConverter({
      layout: "auto",
      fontLoader: createFontsourceLoader({ subset: "latin" }),
    });
    const result = await figma.convert({
      element: document.body,
      width: dims.width,
      height: dims.height,
      name: opts.name,
    });
    const html = result.toClipboardHtml();
    const res = await fetch(opts.saveUrl || "http://127.0.0.1:8793/", {
      method: "POST",
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Frame-Name": opts.file,
      },
      body: html,
    });
    const saved = await res.json();
    return {
      name: opts.name,
      file: opts.file,
      width: dims.width,
      height: dims.height,
      bytes: html.length,
      saved,
      svgIcons: document.querySelectorAll("svg[aria-hidden='true']").length,
    };
  }

  window.__eaFigitCapture = { prepareForFigit, convertAndSave, faIconsToSvg, expandOverflowBoxes };
})();

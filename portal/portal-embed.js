/**
 * Portal in-shell page host.
 * Loads standalone NFP/shadcn HTML into an iframe so the portal sidebar/header stay put.
 */
(function () {
  var PAGE_PARAM = "page";
  var EMBED_FOLDERS = [
    "admin",
    "broker-support",
    "sales-leadership",
    "finance",
    "enrollment-ops",
    "compliance",
    "agent",
    "agency-admin",
    "member"
  ];
  var AUTH_FOLDERS = ["auth", "auth-carrier", "auth-member"];

  var DEFAULT_TITLE = "EnrollAxis";

  var EMBED_CSS =
    "html.portal-embed,body.portal-embed{overflow:auto!important;}" +
    "body.portal-embed .sidebar," +
    "body.portal-embed .sidebar-toggle," +
    "body.portal-embed .sidebar-overlay," +
    "body.portal-embed .ui-sidebar," +
    "body.portal-embed .ui-sidebar-toggle," +
    "body.portal-embed .ui-sidebar-backdrop," +
    "body.portal-embed .ui-sidebar-close," +
    "body.portal-embed .topbar," +
    "body.portal-embed .ui-topbar," +
    "body.portal-embed footer," +
    "body.portal-embed .ui-page-footer{display:none!important;}" +
    "body.portal-embed .main," +
    "body.portal-embed .ui-main{margin-left:0!important;width:100%!important;max-width:100%!important;}" +
    "body.portal-embed .ui-shell{min-height:100%!important;}" +
    "body.portal-embed .wrapper{display:block!important;}" +
    "body.portal-embed .portal-embed-actions{" +
    "display:flex;justify-content:flex-end;align-items:center;gap:8px;" +
    "flex-wrap:wrap;padding:0 0 12px;margin:0;box-sizing:border-box;width:100%;" +
    "background:transparent;border:0;box-shadow:none;" +
    "}";

  var pageEl = document.querySelector("main.p-page");
  if (!pageEl) return;

  var ready = document.getElementById("landingReady");
  var loading = document.getElementById("landingLoading");
  var error = document.getElementById("landingError");
  var navRoot = document.getElementById("navPortals") || document.querySelector(".p-sidebar-nav");
  var titleEl = document.querySelector(".p-carrier-name");
  var iframe = document.getElementById("portalEmbed");
  var syncingFromIframe = false;
  var lastOpened = null;
  var loadBound = false;

  function setPortalTitle(text) {
    if (!titleEl) return;
    var next = String(text || "").replace(/\s+/g, " ").trim();
    titleEl.textContent = next || DEFAULT_TITLE;
    titleEl.setAttribute("title", titleEl.textContent);
  }

  function ensureIframe() {
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.id = "portalEmbed";
      iframe.className = "p-embed-frame";
      iframe.title = "Portal content";
      iframe.setAttribute("hidden", "");
      pageEl.appendChild(iframe);
    }
    if (!loadBound) {
      iframe.addEventListener("load", onIframeLoad);
      loadBound = true;
    }
    return iframe;
  }

  function pathnameOf(url) {
    try {
      return new URL(url, location.href).pathname.replace(/\\/g, "/");
    } catch (e) {
      return "";
    }
  }

  function folderOfPath(pathname) {
    var parts = String(pathname || "").split("/").filter(Boolean);
    return parts.length ? parts[0] : "";
  }

  function isEmbeddablePath(pathname) {
    var folder = folderOfPath(pathname);
    return EMBED_FOLDERS.indexOf(folder) !== -1 && /\.html?$/i.test(pathname);
  }

  function isAuthPath(pathname) {
    return AUTH_FOLDERS.indexOf(folderOfPath(pathname)) !== -1;
  }

  function isEmbeddableHref(href) {
    if (!href || href.charAt(0) === "#") return false;
    try {
      var u = new URL(href, location.href);
      if (u.origin !== location.origin) return false;
      return isEmbeddablePath(u.pathname);
    } catch (e) {
      return false;
    }
  }

  function toPageParam(absUrl) {
    var u = new URL(absUrl, location.href);
    var path = u.pathname.replace(/^\//, "");
    return path + (u.search || "") + (u.hash || "");
  }

  function resolvePageParam(value) {
    if (!value) return null;
    var cleaned = String(value).replace(/^\/+/, "");
    var abs = new URL("../" + cleaned, location.href).href;
    if (!isEmbeddableHref(abs)) return null;
    return abs;
  }

  function setHidden(el, hidden) {
    if (!el) return;
    if (hidden) el.setAttribute("hidden", "");
    else el.removeAttribute("hidden");
  }

  function closeMobileSidebar() {
    var shell = document.getElementById("appShell");
    if (shell) shell.classList.remove("sidebar-open");
    document.body.style.overflow = "";
    var toggle = document.getElementById("sidebarToggle");
    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
    }
  }

  function clearNavActive() {
    if (!navRoot) return;
    navRoot.querySelectorAll("a.p-nav-item.is-active").forEach(function (el) {
      el.classList.remove("is-active");
      el.removeAttribute("aria-current");
    });
  }

  function setDashboardActive(on) {
    if (!navRoot) return;
    var dash = navRoot.querySelector('[data-group="dashboard"]');
    if (dash) {
      dash.classList.toggle("is-active", !!on);
      if (on) dash.setAttribute("aria-current", "page");
      else dash.removeAttribute("aria-current");
    }
    if (!on) return;
    clearNavActive();
  }

  function markLinkActive(absUrl) {
    if (!navRoot) return;
    clearNavActive();
    setDashboardActive(false);
    var targetPath = pathnameOf(absUrl);
    var targetHash = "";
    try {
      targetHash = new URL(absUrl, location.href).hash || "";
    } catch (e) {}

    var links = navRoot.querySelectorAll("a.p-nav-item[href]");
    var best = null;
    var bestScore = -1;
    links.forEach(function (a) {
      var href = a.getAttribute("href");
      if (!href) return;
      var u;
      try {
        u = new URL(href, location.href);
      } catch (e) {
        return;
      }
      if (pathnameOf(u.href) !== targetPath) return;
      var score = 1;
      if ((u.hash || "") === targetHash) score = 3;
      else if (!u.hash && !targetHash) score = 2;
      if (score > bestScore) {
        bestScore = score;
        best = a;
      }
    });
    if (best) {
      best.classList.add("is-active");
      best.setAttribute("aria-current", "page");
      var accordion = best.closest(".p-nav-accordion");
      if (accordion) {
        var key = accordion.getAttribute("data-accordion");
        var trigger = accordion.querySelector(".p-nav-accordion-trigger");
        var panel = accordion.querySelector(".p-nav-panel");
        if (typeof window.portalExpandSidebar === "function") {
          window.portalExpandSidebar();
        }
        navRoot.querySelectorAll(".p-nav-accordion").forEach(function (acc) {
          if (acc === accordion) return;
          var t = acc.querySelector(".p-nav-accordion-trigger");
          var p = acc.querySelector(".p-nav-panel");
          if (t) {
            t.setAttribute("aria-expanded", "false");
            t.classList.remove("is-open");
          }
          if (p) p.hidden = true;
          acc.classList.remove("is-open");
        });
        if (trigger) {
          trigger.setAttribute("aria-expanded", "true");
          trigger.classList.add("is-open");
        }
        if (panel) panel.hidden = false;
        accordion.classList.add("is-open");
        if (key) {
          /* keep accordion open for context */
        }
      }
      var nested = best.closest(".p-nav-group");
      if (nested) {
        var nestToggle = nested.querySelector(".p-nav-toggle");
        var sub = nested.querySelector(".p-nav-sub");
        if (nestToggle) {
          nestToggle.setAttribute("aria-expanded", "true");
          nestToggle.classList.add("is-open");
        }
        if (sub) sub.hidden = false;
      }
    }
  }

  function writeHistory(pageValue, replace) {
    var params = new URLSearchParams(location.search);
    if (pageValue) params.set(PAGE_PARAM, pageValue);
    else params.delete(PAGE_PARAM);
    params.delete("state");
    var qs = params.toString();
    var next = location.pathname + (qs ? "?" + qs : "") + (pageValue ? "" : location.hash || "");
    if (pageValue) {
      /* hash is already included in pageValue when present */
    }
    var method = replace ? "replaceState" : "pushState";
    history[method]({ portalEmbed: true, page: pageValue || null }, "", next);
  }

  function isLogoutControl(el) {
    if (!el || el.nodeType !== 1) return false;
    var title = (el.getAttribute("title") || "").toLowerCase();
    var label = (el.getAttribute("aria-label") || "").toLowerCase();
    var text = (el.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
    var href = (el.getAttribute("href") || "").toLowerCase();
    if (title.indexOf("logout") !== -1 || title.indexOf("sign out") !== -1) return true;
    if (label.indexOf("logout") !== -1 || label.indexOf("sign out") !== -1) return true;
    if (text === "logout" || text === "sign out" || text.indexOf("logout") !== -1) return true;
    if (/auth(?:-carrier|-member)?\//.test(href) && /login\.html/.test(href)) return true;
    if (el.querySelector && el.querySelector(".fa-sign-out-alt, .fa-sign-out, [class*='sign-out']")) {
      if (!text || text.length < 24) return true;
    }
    return false;
  }

  function isActionControl(el) {
    if (!el || el.nodeType !== 1) return false;
    var tag = el.tagName;
    if (tag !== "BUTTON" && tag !== "A") return false;
    if (el.classList && el.classList.contains("sidebar-toggle")) return false;
    if (el.classList && el.classList.contains("ui-sidebar-toggle")) return false;
    if (isLogoutControl(el)) return false;
    return true;
  }

  function collectTopbarActions(topbar) {
    var actions = [];
    if (!topbar) return actions;
    var nodes = topbar.querySelectorAll("button, a");
    nodes.forEach(function (el) {
      if (!isActionControl(el)) return;
      /* Skip branding / nav-only anchors without meaningful action chrome */
      if (el.tagName === "A" && !el.className && !(el.textContent || "").trim() && !el.querySelector("i, svg, img")) {
        return;
      }
      /* Skip plain breadcrumb links inside topbar-left */
      if (el.closest(".breadcrumb-bar, .topbar-left, .ob-topbar-titles")) return;
      /* Skip duplicate portal chrome from shadcn topbars */
      if (el.closest(".ob-topbar-actions, .ob-user-menu, .ob-header-product")) return;
      if (el.classList && (el.classList.contains("ob-notify-btn") || el.classList.contains("ob-user-menu-trigger"))) {
        return;
      }
      actions.push(el);
    });
    return actions;
  }

  function extractPageTitle(doc, topbar) {
    if (topbar) {
      var heading = topbar.querySelector("h4, h1, h2, h3");
      if (heading) {
        var text = (heading.textContent || "").replace(/\s+/g, " ").trim();
        if (text) return text;
      }
    }
    var pageHeading = doc.querySelector(".page h1, .page h4, .ui-page h1, .ob-page-titles h1");
    if (pageHeading) {
      var fallback = (pageHeading.textContent || "").replace(/\s+/g, " ").trim();
      if (fallback) return fallback;
    }
    var docTitle = (doc.title || "").split("|")[0].replace(/\s+/g, " ").trim();
    return docTitle || DEFAULT_TITLE;
  }

  function relocateTopbarActions(doc, topbar) {
    if (!topbar) return;
    var actions = collectTopbarActions(topbar);
    var host =
      doc.querySelector(".page") ||
      doc.querySelector(".ui-page") ||
      doc.querySelector(".main") ||
      doc.querySelector(".ui-main") ||
      doc.body;
    if (!host) return;

    var existing = doc.getElementById("portalEmbedActions");
    if (existing) existing.remove();

    if (!actions.length) return;

    var bar = doc.createElement("div");
    bar.id = "portalEmbedActions";
    bar.className = "portal-embed-actions";
    actions.forEach(function (el) {
      bar.appendChild(el);
    });
    host.insertBefore(bar, host.firstChild);
  }

  function applyEmbedChrome(doc) {
    if (!doc || !doc.documentElement) return;
    doc.documentElement.classList.add("portal-embed");
    if (doc.body) doc.body.classList.add("portal-embed");
    if (!doc.getElementById("portal-embed-chrome")) {
      var style = doc.createElement("style");
      style.id = "portal-embed-chrome";
      style.textContent = EMBED_CSS;
      (doc.head || doc.documentElement).appendChild(style);
    }
    wireAuthBreakout(doc);

    var topbar = doc.querySelector(".topbar, .ui-topbar");
    setPortalTitle(extractPageTitle(doc, topbar));
    relocateTopbarActions(doc, topbar);

    /* Remove logout controls left in the hidden topbar (and any stray copies). */
    if (topbar) {
      topbar.querySelectorAll("a, button").forEach(function (el) {
        if (isLogoutControl(el)) el.remove();
      });
    }
  }

  function wireAuthBreakout(doc) {
    if (!doc || doc.documentElement.getAttribute("data-portal-auth-wired") === "1") return;
    doc.documentElement.setAttribute("data-portal-auth-wired", "1");
    doc.addEventListener(
      "click",
      function (event) {
        var a = event.target.closest && event.target.closest("a[href]");
        if (!a) return;
        var href = a.getAttribute("href");
        if (!href || href.charAt(0) === "#") return;
        var abs;
        try {
          abs = new URL(href, doc.baseURI || location.href);
        } catch (e) {
          return;
        }
        if (abs.origin !== location.origin) return;
        if (!isAuthPath(abs.pathname)) return;
        event.preventDefault();
        window.top.location.href = abs.href;
      },
      true
    );
  }

  function onIframeLoad() {
    var frame = ensureIframe();
    if (frame.hasAttribute("hidden")) return;
    var win;
    var doc;
    try {
      win = frame.contentWindow;
      doc = frame.contentDocument;
    } catch (e) {
      return;
    }
    if (!doc || !doc.body) return;

    var abs;
    try {
      abs = win.location.href;
    } catch (e2) {
      return;
    }
    if (!abs || abs === "about:blank") return;
    if (isAuthPath(pathnameOf(abs))) {
      window.top.location.href = abs;
      return;
    }
    if (!isEmbeddablePath(pathnameOf(abs))) return;
    applyEmbedChrome(doc);

    var pageValue = toPageParam(abs);
    markLinkActive(abs);
    lastOpened = abs;
    if (!syncingFromIframe) {
      syncingFromIframe = true;
      var current = new URLSearchParams(location.search).get(PAGE_PARAM);
      if (current !== pageValue) writeHistory(pageValue, true);
      syncingFromIframe = false;
    }
  }

  function showDashboard(opts) {
    opts = opts || {};
    var frame = ensureIframe();
    pageEl.classList.remove("is-embedded");
    setHidden(frame, true);
    try {
      frame.removeAttribute("src");
    } catch (e) {}
    if (ready) setHidden(ready, false);
    if (loading) setHidden(loading, true);
    if (error) setHidden(error, true);
    setDashboardActive(true);
    setPortalTitle(DEFAULT_TITLE);
    lastOpened = null;
    if (!opts.skipHistory) writeHistory(null, !!opts.replace);
    closeMobileSidebar();
    if (ready && opts.scroll !== false) {
      try {
        ready.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch (e2) {}
    }
  }

  function openPage(href, opts) {
    opts = opts || {};
    if (!isEmbeddableHref(href)) return false;
    var abs = new URL(href, location.href).href;
    var frame = ensureIframe();
    pageEl.classList.add("is-embedded");
    if (ready) setHidden(ready, true);
    if (loading) setHidden(loading, true);
    if (error) setHidden(error, true);
    setHidden(frame, false);
    markLinkActive(abs);
    lastOpened = abs;
    var pageValue = toPageParam(abs);
    if (!opts.skipHistory) writeHistory(pageValue, !!opts.replace);
    closeMobileSidebar();
    if (frame.getAttribute("src") === abs) {
      try {
        frame.contentWindow.location.replace(abs);
      } catch (e) {
        frame.src = abs;
      }
    } else {
      frame.src = abs;
    }
    return true;
  }

  function restoreFromUrl(replace) {
    var page = new URLSearchParams(location.search).get(PAGE_PARAM);
    if (!page) {
      showDashboard({ skipHistory: true, scroll: false, replace: replace });
      return;
    }
    var abs = resolvePageParam(page);
    if (!abs) {
      showDashboard({ skipHistory: false, replace: true, scroll: false });
      return;
    }
    openPage(abs, { skipHistory: true, replace: replace });
  }

  function shouldIgnoreClick(event, anchor) {
    if (event.defaultPrevented) return true;
    if (event.button !== 0) return true;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return true;
    if (anchor.target && anchor.target !== "" && anchor.target !== "_self") return true;
    return false;
  }

  document.addEventListener(
    "click",
    function (event) {
      var a = event.target.closest && event.target.closest("a[href]");
      if (!a || !document.body.contains(a)) return;
      if (shouldIgnoreClick(event, a)) return;
      var href = a.getAttribute("href");
      if (!href || href.charAt(0) === "#") return;

      /* Home / landing links inside portal return to dashboard */
      try {
        var u = new URL(href, location.href);
        if (
          u.origin === location.origin &&
          /\/portal\/landing-[a-z0-9-]+\.html$/i.test(u.pathname) &&
          u.pathname === location.pathname
        ) {
          event.preventDefault();
          showDashboard();
          return;
        }
      } catch (e) {}

      if (!isEmbeddableHref(href)) return;
      event.preventDefault();
      event.stopPropagation();
      openPage(href);
    },
    true
  );

  window.addEventListener("popstate", function () {
    restoreFromUrl(true);
  });

  ensureIframe();
  restoreFromUrl(true);

  window.PortalEmbed = {
    open: openPage,
    showDashboard: showDashboard,
    isEmbeddable: isEmbeddableHref,
    getCurrent: function () {
      return lastOpened;
    }
  };
})();

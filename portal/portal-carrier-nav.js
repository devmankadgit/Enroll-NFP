/**
 * Carrier landing - combined thematic menus (all portals) with drill-down groups.
 */
(function () {
  var navRoot = document.getElementById("navPortals");
  var navDrill = document.getElementById("navPortalMenus");
  var navBody = document.getElementById("navPortalBody");
  var navTitle = document.getElementById("navPortalTitle");
  var navBack = document.getElementById("navBack");
  if (!navRoot || !navDrill || !navBody || !navTitle || !navBack) return;

  var ADMIN = "../admin/";
  var BROKER = "../broker-support/";
  var SALES = "../sales-leadership/";
  var FINANCE = "../finance/";
  var ENROLL = "../enrollment-ops/";
  var COMPLY = "../compliance/";

  function item(href, icon, label, opts) {
    opts = opts || {};
    return {
      type: "link",
      href: href,
      icon: icon,
      label: label,
      badge: opts.badge || null,
      active: !!opts.active
    };
  }

  function group(icon, label, children) {
    return { type: "group", icon: icon, label: label, children: children || [] };
  }

  var MENUS = {
    "agent-producer": {
      title: "Agent & Producer",
      items: [
        item(ADMIN + "agents.html", "fa-id-card", "Agent Management", { active: true }),
        item(ADMIN + "agent-invitations.html", "fa-paper-plane", "Agent Invitations"),
        item(ADMIN + "onboarding-cases.html", "fa-folder-open", "Onboarding Cases"),
        item(ADMIN + "hierarchy.html", "fa-sitemap", "Producer Hierarchy"),
        item(ADMIN + "recredentialing.html", "fa-sync-alt", "Annual Re-Credentialing", { badge: "5" }),
        item(ADMIN + "agent-feed.html", "fa-rss", "Daily Agent Feed"),
        item(ADMIN + "agency-details.html", "fa-building", "Agency Details"),
        item(BROKER + "agent-lookup.html", "fa-search", "Agent Lookup"),
        item(BROKER + "agent-lifecycle.html", "fa-user-shield", "Agent Lifecycle"),
        item(BROKER + "onboarding-queue.html", "fa-user-clock", "Onboarding Queue", { badge: "12" }),
        item(BROKER + "activation-queue.html", "fa-check-circle", "Activation Status"),
        item(BROKER + "invitations.html", "fa-envelope-open-text", "Invitations"),
        item(SALES + "top-producers.html", "fa-trophy", "Top Producers"),
        item(SALES + "network-health.html", "fa-heartbeat", "Agent Network Health"),
        item(SALES + "active-agents.html", "fa-user-check", "Active Agents"),
        item(SALES + "hierarchy-view.html", "fa-sitemap", "Hierarchy View"),
        item(COMPLY + "compliance-hold.html", "fa-pause-circle", "Compliance Holds"),
        item(COMPLY + "reactivation.html", "fa-undo", "Reactivation"),
        item(COMPLY + "onboarding-review.html", "fa-clipboard-check", "Onboarding Review")
      ]
    },
    "members-leads": {
      title: "Members & Leads",
      items: [
        item(ADMIN + "leads.html", "fa-users", "Leads & Assignment"),
        item(SALES + "leads.html", "fa-address-book", "View Leads"),
        item(SALES + "leads.html#assign", "fa-user-tag", "Assign Leads"),
        item(SALES + "lead-performance.html", "fa-phone-volume", "Lead Performance"),
        item(BROKER + "member-inquiry.html", "fa-id-card", "Member Inquiry"),
        item(SALES + "enrollment-trends.html", "fa-chart-area", "Enrollment Details"),
        item(SALES + "geographic-insights.html", "fa-map-marked-alt", "Geographic Insights"),
        item(SALES + "patient-activation.html", "fa-hand-holding-heart", "Patient Activation"),
        item(ENROLL + "document-repository.html", "fa-folder-open", "Document Repository"),
        item(ENROLL + "id-cards.html", "fa-id-card", "ID Cards")
      ]
    },
    "commissions-finance": {
      title: "Commissions & Finance",
      items: [
        item(ADMIN + "commission-rules.html", "fa-cogs", "Commission Rules"),
        item(ADMIN + "commission-approval.html", "fa-check-circle", "Commission Approval"),
        item(FINANCE + "calc-engine.html", "fa-calculator", "Calculation Engine"),
        item(FINANCE + "run-history.html", "fa-history", "Run History"),
        item(FINANCE + "commission-config.html", "fa-sliders-h", "Configuration"),
        item(FINANCE + "banking-gap.html", "fa-university", "Banking Holds"),
        item(FINANCE + "missing-npn.html", "fa-id-badge", "Missing NPN"),
        item(FINANCE + "missing-cms-data.html", "fa-database", "Missing CMS Data"),
        item(FINANCE + "compliance-holds.html", "fa-shield-alt", "Compliance Holds"),
        item(FINANCE + "chargebacks.html", "fa-undo", "Chargebacks"),
        item(FINANCE + "hra-review.html", "fa-clipboard-check", "HRA Incentive Review"),
        item(FINANCE + "manual-adjustments.html", "fa-edit", "Manual Adjustments"),
        item(FINANCE + "batch-review.html", "fa-search-dollar", "Review Batch"),
        item(FINANCE + "ach-nacha.html", "fa-university", "Generate ACH / Checks"),
        item(FINANCE + "batches.html", "fa-credit-card", "Release Payments"),
        item(FINANCE + "remittance.html", "fa-receipt", "Payment History"),
        item(FINANCE + "reconciliation.html", "fa-balance-scale", "Reconciliation"),
        item(FINANCE + "bob-ledger.html", "fa-book", "Book of Business"),
        item(FINANCE + "disputes.html", "fa-gavel", "Dispute Queue"),
        item(FINANCE + "reports.html", "fa-chart-bar", "Finance Reports"),
        item(FINANCE + "calc-audit.html", "fa-fingerprint", "Audit Trail"),
        item(BROKER + "commission-inquiries.html", "fa-dollar-sign", "Commission Inquiries"),
        item(SALES + "commission-trends.html", "fa-dollar-sign", "Commission Trends"),
        item(SALES + "cost-distribution.html", "fa-balance-scale", "Cost of Distribution")
      ]
    },
    "training-compliance": {
      title: "Training & Compliance",
      items: [
        group("fa-graduation-cap", "Training Management", [
          item(ADMIN + "training-admin.html", "fa-chart-line", "Training Package"),
          item(ADMIN + "training-package-create.html", "fa-plus-circle", "Create Training Package"),
          item(ADMIN + "agent-training-progress.html", "fa-user-graduate", "Agent Training Progress"),
          item(COMPLY + "training-tracker.html", "fa-graduation-cap", "Training Tracker")
        ]),
        item(BROKER + "nipr-alerts.html", "fa-bell", "NIPR Alerts", { badge: "5" }),
        item(BROKER + "ahip-renewals.html", "fa-certificate", "AHIP Renewals"),
        item(BROKER + "state-appointments.html", "fa-map-marker-alt", "State Appointments"),
        item(BROKER + "compliance-holds.html", "fa-ban", "Compliance Holds"),
        item(BROKER + "override-approvals.html", "fa-unlock-alt", "Override Requests", { badge: "3" }),
        item(COMPLY + "override-queue.html", "fa-exclamation-circle", "Override Co-sign"),
        item(COMPLY + "soa-compliance.html", "fa-file-signature", "SOA Compliance"),
        item(COMPLY + "exclusion-monitoring.html", "fa-ban", "OIG/SAM Exclusions"),
        item(COMPLY + "analytics.html", "fa-chart-line", "Compliance Analytics"),
        item(COMPLY + "audit-trail.html", "fa-history", "Audit Trail"),
        item(COMPLY + "document-search.html", "fa-search", "Document Search"),
        item(COMPLY + "export-panel.html", "fa-file-export", "Export Panel"),
        item(COMPLY + "rules-config.html", "fa-cogs", "Rules Configuration")
      ]
    },
    "support-ops": {
      title: "Support Operations",
      items: [
        item(BROKER + "support-cases.html", "fa-inbox", "Support Cases", { badge: "34" }),
        item(BROKER + "sla-tracker.html", "fa-stopwatch", "SLA Tracker"),
        item(BROKER + "reports.html", "fa-chart-bar", "Support Reports"),
        item(ADMIN + "exceptions.html", "fa-exclamation-circle", "Exceptions & Disputes")
      ]
    },
    "sales-campaigns": {
      title: "Sales & Campaigns",
      items: [
        item(SALES + "agencies.html", "fa-building", "View Agencies"),
        item(SALES + "campaign-roi.html", "fa-bullseye", "Campaign ROI"),
        item(SALES + "reports.html", "fa-file-alt", "Scheduled Reports"),
        item(ADMIN + "reports.html", "fa-chart-bar", "Carrier Reports")
      ]
    },
    "enrollment-ops": {
      title: "Enrollment Ops",
      items: [
        item(ENROLL + "processing-hub.html", "fa-inbox", "Processing Hub"),
        item(ENROLL + "oec-intake.html", "fa-inbox", "OEC Intake Hub"),
        item(ENROLL + "csnp-review.html", "fa-heartbeat", "C-SNP Review"),
        item(ENROLL + "compliance-tracker.html", "fa-clock", "7-Day Compliance"),
        item(ENROLL + "audit-trail.html", "fa-history", "Audit Trail")
      ]
    },
    "system-config": {
      title: "System & Configuration",
      items: [
        group("fa-users-cog", "User Management", [
          item(ADMIN + "users.html", "fa-id-card", "User Details"),
          item(ADMIN + "roles.html", "fa-user-shield", "Roles & Permissions"),
          item(ADMIN + "feature-toggles.html", "fa-toggle-on", "Feature Toggles")
        ]),
        item(ADMIN + "plan-catalog.html", "fa-clipboard-list", "Plan Catalog"),
        item(ADMIN + "carrier-setup.html", "fa-hospital", "Carrier Profile Management"),
        item(ADMIN + "notifications-config.html", "fa-bell", "Notifications Config"),
        item(ADMIN + "templates.html", "fa-file-alt", "Document Templates"),
        item(ADMIN + "master-data.html", "fa-database", "Master Data"),
        item(ADMIN + "integrations.html", "fa-plug", "Integration Hub"),
        item(ADMIN + "audit-log.html", "fa-history", "Audit Log")
      ]
    }
  };

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderLink(entry) {
    var cls = "p-nav-item" + (entry.active ? " is-active" : "");
    var badge = entry.badge
      ? '<span class="p-nav-badge">' + escapeHtml(entry.badge) + "</span>"
      : "";
    return (
      '<a class="' +
      cls +
      '" href="' +
      escapeHtml(entry.href) +
      '">' +
      '<i class="fas ' +
      escapeHtml(entry.icon) +
      '" aria-hidden="true"></i>' +
      '<span class="p-nav-label">' +
      escapeHtml(entry.label) +
      "</span>" +
      badge +
      "</a>"
    );
  }

  function renderGroup(entry) {
    var children = (entry.children || [])
      .map(function (child) {
        return renderLink(child);
      })
      .join("");
    return (
      '<div class="p-nav-group">' +
      '<button type="button" class="p-nav-item p-nav-toggle" aria-expanded="false">' +
      '<i class="fas ' +
      escapeHtml(entry.icon) +
      '" aria-hidden="true"></i>' +
      '<span class="p-nav-label">' +
      escapeHtml(entry.label) +
      "</span>" +
      '<i class="fas fa-chevron-down p-nav-chev" aria-hidden="true"></i>' +
      "</button>" +
      '<div class="p-nav-sub" hidden>' +
      children +
      "</div>" +
      "</div>"
    );
  }

  function renderMenu(menu) {
    return (menu.items || [])
      .map(function (entry) {
        if (entry.type === "group") return renderGroup(entry);
        return renderLink(entry);
      })
      .join("");
  }

  function setRootActive(key) {
    navRoot.querySelectorAll("[data-group]").forEach(function (btn) {
      var active = btn.getAttribute("data-group") === key;
      btn.classList.toggle("is-active", active);
      if (active) btn.setAttribute("aria-current", "page");
      else btn.removeAttribute("aria-current");
    });
  }

  function showRoot(activeKey) {
    navDrill.hidden = true;
    navRoot.hidden = false;
    navBody.innerHTML = "";
    navTitle.textContent = "";
    setRootActive(activeKey || "dashboard");
  }

  function showGroup(key) {
    var menu = MENUS[key];
    if (!menu) return;
    if (typeof window.portalExpandSidebar === "function") {
      window.portalExpandSidebar();
    }
    navTitle.textContent = menu.title;
    navBody.innerHTML = renderMenu(menu);
    navRoot.hidden = true;
    navDrill.hidden = false;
    setRootActive(key);
    navBack.focus();
  }

  navRoot.addEventListener("click", function (event) {
    var btn = event.target.closest("[data-group]");
    if (!btn || !navRoot.contains(btn)) return;
    event.preventDefault();
    var key = btn.getAttribute("data-group");
    if (key === "dashboard") {
      showRoot("dashboard");
      var ready = document.getElementById("landingReady");
      if (ready) ready.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    showGroup(key);
  });

  navBack.addEventListener("click", function () {
    showRoot("dashboard");
  });

  navBody.addEventListener("click", function (event) {
    var toggle = event.target.closest(".p-nav-toggle");
    if (!toggle || !navBody.contains(toggle)) return;
    event.preventDefault();
    var groupEl = toggle.closest(".p-nav-group");
    if (!groupEl) return;
    var sub = groupEl.querySelector(".p-nav-sub");
    var open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", open ? "false" : "true");
    toggle.classList.toggle("is-open", !open);
    if (sub) sub.hidden = open;
  });

  showRoot("dashboard");
})();

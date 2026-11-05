/**
 * Carrier landing - drill into payer portal menus without leaving the landing shell.
 */
(function () {
  var navRoot = document.getElementById("navPortals");
  var navDrill = document.getElementById("navPortalMenus");
  var navBody = document.getElementById("navPortalBody");
  var navTitle = document.getElementById("navPortalTitle");
  var navBack = document.getElementById("navBack");
  if (!navRoot || !navDrill || !navBody || !navTitle || !navBack) return;

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

  function section(label) {
    return { type: "section", label: label };
  }

  function group(icon, label, children) {
    return { type: "group", icon: icon, label: label, children: children || [] };
  }

  var MENUS = {
    "payer-admin": {
      title: "Payer Admin",
      base: "../admin/",
      items: [
        item("dashboard.html", "fa-tachometer-alt", "Dashboard", { active: true }),
        section("Agent & Producer"),
        item("agents.html", "fa-id-card", "Agent Management"),
        item("agent-invitations.html", "fa-paper-plane", "Agent Invitations"),
        item("onboarding-cases.html", "fa-folder-open", "Onboarding Cases"),
        item("hierarchy.html", "fa-sitemap", "Producer Hierarchy"),
        item("recredentialing.html", "fa-sync-alt", "Annual Re-Credentialing", { badge: "5" }),
        item("agent-feed.html", "fa-rss", "Daily Agent Feed"),
        item("agency-details.html", "fa-building", "Agency Details"),
        section("Members & Leads"),
        item("leads.html", "fa-users", "Leads & Assignment"),
        section("Commissions & Finance"),
        item("commission-rules.html", "fa-cogs", "Commission Rules"),
        item("commission-approval.html", "fa-check-circle", "Commission Approval"),
        section("Training & Compliance"),
        group("fa-graduation-cap", "Training Management", [
          item("training-admin.html", "fa-chart-line", "Training Package"),
          item("training-package-create.html", "fa-plus-circle", "Create Training Package"),
          item("agent-training-progress.html", "fa-user-graduate", "Agent Training Progress")
        ]),
        section("System & Configuration"),
        group("fa-users-cog", "User Management", [
          item("users.html", "fa-id-card", "User Details"),
          item("roles.html", "fa-user-shield", "Roles & Permissions"),
          item("feature-toggles.html", "fa-toggle-on", "Feature Toggles")
        ]),
        item("plan-catalog.html", "fa-clipboard-list", "Plan Catalog"),
        item("carrier-setup.html", "fa-hospital", "Carrier Profile Management"),
        item("notifications-config.html", "fa-bell", "Notifications Config"),
        item("templates.html", "fa-file-alt", "Document Templates"),
        item("master-data.html", "fa-database", "Master Data"),
        item("integrations.html", "fa-plug", "Integration Hub"),
        item("reports.html", "fa-chart-bar", "Reports"),
        item("exceptions.html", "fa-exclamation-circle", "Exceptions & Disputes"),
        item("audit-log.html", "fa-history", "Audit Log")
      ]
    },
    "broker-support": {
      title: "Broker Support",
      base: "../broker-support/",
      items: [
        item("dashboard.html", "fa-tachometer-alt", "Dashboard", { active: true }),
        item("support-cases.html", "fa-inbox", "Support Cases", { badge: "34" }),
        section("Agent Support"),
        item("agent-lookup.html", "fa-search", "Agent Lookup"),
        item("agent-lifecycle.html", "fa-user-shield", "Agent Lifecycle"),
        item("onboarding-queue.html", "fa-user-clock", "Onboarding Queue", { badge: "12" }),
        item("activation-queue.html", "fa-check-circle", "Activation Status"),
        item("invitations.html", "fa-envelope-open-text", "Invitations"),
        section("Member & Enrollment"),
        item("member-inquiry.html", "fa-id-card", "Member Inquiry"),
        section("Compliance & Licensing"),
        item("nipr-alerts.html", "fa-bell", "NIPR Alerts", { badge: "5" }),
        item("ahip-renewals.html", "fa-certificate", "AHIP Renewals"),
        item("state-appointments.html", "fa-map-marker-alt", "State Appointments"),
        item("compliance-holds.html", "fa-ban", "Compliance Holds"),
        item("override-approvals.html", "fa-unlock-alt", "Override Requests", { badge: "3" }),
        section("Operations & SLA"),
        item("commission-inquiries.html", "fa-dollar-sign", "Commission Inquiries"),
        item("sla-tracker.html", "fa-stopwatch", "SLA Tracker"),
        item("reports.html", "fa-chart-bar", "Reports")
      ]
    },
    "sales-leadership": {
      title: "Sales Leadership",
      base: "../sales-leadership/",
      items: [
        item("dashboard.html", "fa-tachometer-alt", "Dashboard", { active: true }),
        section("Campaigns & Leads"),
        item("agencies.html", "fa-building", "View Agencies"),
        item("leads.html", "fa-address-book", "View Leads"),
        item("leads.html#assign", "fa-user-tag", "Assign Leads"),
        item("campaign-roi.html", "fa-bullseye", "Campaign ROI"),
        item("lead-performance.html", "fa-phone-volume", "Lead Performance"),
        section("Producer Performance"),
        item("top-producers.html", "fa-trophy", "Top Producers"),
        item("network-health.html", "fa-heartbeat", "Agent Network Health"),
        item("active-agents.html", "fa-user-check", "Active Agents"),
        item("hierarchy-view.html", "fa-sitemap", "Hierarchy View"),
        section("Enrollment & Members"),
        item("enrollment-trends.html", "fa-chart-area", "Enrollment Details"),
        item("geographic-insights.html", "fa-map-marked-alt", "Geographic Insights"),
        item("patient-activation.html", "fa-hand-holding-heart", "Patient Activation"),
        section("Commissions & Cost"),
        item("commission-trends.html", "fa-dollar-sign", "Commission Trends"),
        item("cost-distribution.html", "fa-balance-scale", "Cost of Distribution"),
        section("Reports"),
        item("reports.html", "fa-file-alt", "Scheduled Reports")
      ]
    },
    "finance": {
      title: "Finance User",
      base: "../finance/",
      items: [
        item("dashboard.html", "fa-tachometer-alt", "Dashboard", { active: true }),
        section("Commission Processing"),
        item("calc-engine.html", "fa-calculator", "Calculation Engine"),
        item("run-history.html", "fa-history", "Run History"),
        item("commission-config.html", "fa-sliders-h", "Configuration"),
        section("Payment Exceptions"),
        item("banking-gap.html", "fa-university", "Banking Holds"),
        item("missing-npn.html", "fa-id-badge", "Missing NPN"),
        item("missing-cms-data.html", "fa-database", "Missing CMS Data"),
        item("compliance-holds.html", "fa-shield-alt", "Compliance Holds"),
        item("chargebacks.html", "fa-undo", "Chargebacks"),
        item("hra-review.html", "fa-clipboard-check", "HRA Incentive Review"),
        item("manual-adjustments.html", "fa-edit", "Manual Adjustments"),
        section("Payment Batch"),
        item("batch-review.html", "fa-search-dollar", "Review Batch"),
        item("ach-nacha.html", "fa-university", "Generate ACH / Checks"),
        item("batches.html", "fa-credit-card", "Release Payments"),
        item("remittance.html", "fa-receipt", "Payment History"),
        item("reconciliation.html", "fa-balance-scale", "Reconciliation"),
        item("bob-ledger.html", "fa-book", "Book of Business"),
        section("Dispute Management"),
        item("disputes.html", "fa-gavel", "Dispute Queue"),
        section("Reports & Audit"),
        item("reports.html", "fa-chart-bar", "Reports"),
        item("calc-audit.html", "fa-fingerprint", "Audit Trail")
      ]
    },
    "enrollment-ops": {
      title: "Enrollment Ops",
      base: "../enrollment-ops/",
      items: [
        item("dashboard.html", "fa-tachometer-alt", "Dashboard", { active: true }),
        section("Enrollment Processing"),
        item("processing-hub.html", "fa-inbox", "Processing Hub"),
        item("oec-intake.html", "fa-inbox", "OEC Intake Hub"),
        item("csnp-review.html", "fa-heartbeat", "C-SNP Review"),
        item("compliance-tracker.html", "fa-clock", "7-Day Compliance"),
        section("Member Services"),
        item("document-repository.html", "fa-folder-open", "Document Repository"),
        item("id-cards.html", "fa-id-card", "ID Cards"),
        item("audit-trail.html", "fa-history", "Audit Trail")
      ]
    },
    "compliance": {
      title: "Compliance Officer",
      base: "../compliance/",
      items: [
        item("dashboard.html", "fa-tachometer-alt", "Dashboard", { active: true }),
        section("Agent Compliance"),
        item("compliance-hold.html", "fa-pause-circle", "Compliance Holds"),
        item("reactivation.html", "fa-undo", "Reactivation"),
        item("onboarding-review.html", "fa-clipboard-check", "Onboarding Cases"),
        item("training-tracker.html", "fa-graduation-cap", "Training Tracker"),
        item("override-queue.html", "fa-exclamation-circle", "Override Co-sign"),
        section("Monitoring & Audit"),
        item("soa-compliance.html", "fa-file-signature", "SOA Compliance"),
        item("exclusion-monitoring.html", "fa-ban", "OIG/SAM Exclusions"),
        item("analytics.html", "fa-chart-line", "Compliance Analytics"),
        item("audit-trail.html", "fa-history", "Audit Trail"),
        item("document-search.html", "fa-search", "Document Search"),
        item("export-panel.html", "fa-file-export", "Export Panel"),
        section("Configuration"),
        item("rules-config.html", "fa-cogs", "Rules Configuration")
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

  function renderLink(entry, base) {
    var cls = "p-nav-item" + (entry.active ? " is-active" : "");
    var badge = entry.badge
      ? '<span class="p-nav-badge">' + escapeHtml(entry.badge) + "</span>"
      : "";
    return (
      '<a class="' +
      cls +
      '" href="' +
      escapeHtml(base + entry.href) +
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

  function renderGroup(entry, base) {
    var children = (entry.children || [])
      .map(function (child) {
        return renderLink(child, base);
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
        if (entry.type === "section") {
          return '<div class="p-nav-section">' + escapeHtml(entry.label) + "</div>";
        }
        if (entry.type === "group") {
          return renderGroup(entry, menu.base);
        }
        return renderLink(entry, menu.base);
      })
      .join("");
  }

  function showRoot() {
    navDrill.hidden = true;
    navRoot.hidden = false;
    navBody.innerHTML = "";
    navTitle.textContent = "";
    navRoot.querySelectorAll("[data-portal]").forEach(function (btn) {
      btn.classList.remove("is-active");
      btn.removeAttribute("aria-current");
    });
  }

  function showPortal(key) {
    var menu = MENUS[key];
    if (!menu) return;
    if (typeof window.portalExpandSidebar === "function") {
      window.portalExpandSidebar();
    }
    navTitle.textContent = menu.title;
    navBody.innerHTML = renderMenu(menu);
    navRoot.hidden = true;
    navDrill.hidden = false;
    navRoot.querySelectorAll("[data-portal]").forEach(function (btn) {
      var active = btn.getAttribute("data-portal") === key;
      btn.classList.toggle("is-active", active);
      if (active) btn.setAttribute("aria-current", "true");
      else btn.removeAttribute("aria-current");
    });
    navBack.focus();
  }

  navRoot.addEventListener("click", function (event) {
    var btn = event.target.closest("[data-portal]");
    if (!btn || !navRoot.contains(btn)) return;
    event.preventDefault();
    showPortal(btn.getAttribute("data-portal"));
  });

  navBack.addEventListener("click", function () {
    showRoot();
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
})();

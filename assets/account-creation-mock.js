/**
 * Shared mock state for the NFP Agent Invitation → Account Creation prototype.
 * Persists across pages via localStorage. Frontend-only; no backend.
 */
(function (global) {
  var STORAGE_KEY = "eaAccountCreationFlow";
  var DEMO_KEY = "eaAccountCreationDemo";

  var DEFAULTS = {
    invitationToken: "mock-invitation-token",
    passwordToken: "mock-password-token",
    status: "invitation_sent",
    firstName: "Sandra",
    lastName: "Adams",
    email: "sandra.adams@example.com",
    username: "agent.demo",
    password: "",
    carrier: "Gold Kidney Health Plan",
    agency: "Sunrise Agency",
    inviter: "Mark Ellis",
    inviterRole: "Payer Admin",
    role: "Agent",
    level: "Agent/Broker",
    planYear: "2026",
    invitationId: "INV-DEMO-0001",
    expiresAt: "",
    acceptedAt: "",
    accountCreatedAt: "",
    passwordSetAt: ""
  };

  function nowIso() {
    return new Date().toISOString();
  }

  function defaultExpiry() {
    return new Date(Date.now() + 72 * 3600000).toISOString();
  }

  function readRaw() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function write(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) { /* ignore */ }
    return state;
  }

  function ensure() {
    var state = readRaw();
    if (!state) {
      state = Object.assign({}, DEFAULTS, { expiresAt: defaultExpiry() });
      write(state);
    }
    return state;
  }

  function get() {
    return ensure();
  }

  function update(patch) {
    var next = Object.assign({}, ensure(), patch || {});
    return write(next);
  }

  function resetDemo() {
    var fresh = Object.assign({}, DEFAULTS, {
      expiresAt: defaultExpiry(),
      password: "",
      acceptedAt: "",
      accountCreatedAt: "",
      passwordSetAt: "",
      status: "invitation_sent"
    });
    return write(fresh);
  }

  function setDemoMode(on) {
    try {
      if (on) localStorage.setItem(DEMO_KEY, "1");
      else localStorage.removeItem(DEMO_KEY);
    } catch (e) { /* ignore */ }
  }

  function isDemoMode() {
    try {
      if (localStorage.getItem(DEMO_KEY) === "1") return true;
    } catch (e) { /* ignore */ }
    try {
      return new URLSearchParams(location.search).get("demo") === "1";
    } catch (e2) {
      return false;
    }
  }

  function makeUsername(first, last, email) {
    var base = "";
    if (first && last) {
      base = (first.charAt(0) + last).toLowerCase().replace(/[^a-z0-9]/g, "");
    }
    if (!base && email) base = String(email).split("@")[0].toLowerCase().replace(/[^a-z0-9._-]/g, "");
    return base || "agent.demo";
  }

  function createInvitation(details) {
    var first = (details && details.firstName) || DEFAULTS.firstName;
    var last = (details && details.lastName) || DEFAULTS.lastName;
    var email = (details && details.email) || DEFAULTS.email;
    var token =
      (details && details.token) ||
      "tk_" + Math.random().toString(36).substring(2, 10).toUpperCase();
    var expiryHours = (details && details.expiryHours) || 72;
    var state = update({
      invitationToken: token,
      passwordToken: "pwd_" + Math.random().toString(36).substring(2, 10).toUpperCase(),
      status: "invitation_sent",
      firstName: first,
      lastName: last,
      email: email,
      username: makeUsername(first, last, email),
      password: "",
      carrier: (details && details.carrier) || DEFAULTS.carrier,
      agency: (details && details.agency) || DEFAULTS.agency,
      inviter: (details && details.inviter) || DEFAULTS.inviter,
      inviterRole: (details && details.inviterRole) || DEFAULTS.inviterRole,
      role: (details && details.role) || DEFAULTS.role,
      level: (details && details.level) || DEFAULTS.level,
      planYear: (details && details.planYear) || DEFAULTS.planYear,
      invitationId: (details && details.invitationId) || ("INV-" + Date.now().toString(36).toUpperCase()),
      expiresAt: new Date(Date.now() + expiryHours * 3600000).toISOString(),
      acceptedAt: "",
      accountCreatedAt: "",
      passwordSetAt: ""
    });
    return state;
  }

  function findByInviteToken(token) {
    var state = get();
    if (!token) return { ok: false, reason: "missing" };
    if (token !== state.invitationToken && token !== "mock-invitation-token") {
      return { ok: false, reason: "invalid" };
    }
    if (state.expiresAt && new Date(state.expiresAt).getTime() < Date.now() && state.status === "invitation_sent") {
      return { ok: false, reason: "expired", state: state };
    }
    return { ok: true, state: state };
  }

  function findByPasswordToken(token) {
    var state = get();
    if (!token) return { ok: false, reason: "missing" };
    if (token !== state.passwordToken && token !== "mock-password-token") {
      return { ok: false, reason: "invalid" };
    }
    if (state.status === "password_set") {
      return { ok: false, reason: "used", state: state };
    }
    if (state.status !== "account_created" && state.status !== "account_creation_pending") {
      if (state.status === "invitation_sent" || state.status === "invitation_accepted") {
        return { ok: false, reason: "not_ready", state: state };
      }
    }
    return { ok: true, state: state };
  }

  function acceptInvitation(token) {
    var found = findByInviteToken(token);
    if (!found.ok) return found;
    var state = found.state;
    if (state.status === "invitation_accepted" || state.status === "account_creation_pending" ||
        state.status === "account_created" || state.status === "password_set") {
      return { ok: true, already: true, state: state };
    }
    state = update({
      status: "account_creation_pending",
      acceptedAt: nowIso()
    });
    return { ok: true, already: false, state: state };
  }

  function completeAccountCreation() {
    var state = get();
    if (state.status === "account_created" || state.status === "password_set") {
      return state;
    }
    if (!state.username) {
      state.username = makeUsername(state.firstName, state.lastName, state.email);
    }
    return update({
      status: "account_created",
      accountCreatedAt: nowIso(),
      username: state.username || "agent.demo"
    });
  }

  function setPassword(token, password) {
    var found = findByPasswordToken(token);
    if (!found.ok) {
      // Allow when account_created even if status was pending and completed via demo
      var state = get();
      if ((token === state.passwordToken || token === "mock-password-token") &&
          (state.status === "account_created" || state.status === "account_creation_pending")) {
        if (state.status === "account_creation_pending") completeAccountCreation();
      } else {
        return found;
      }
    }
    return {
      ok: true,
      state: update({
        status: "password_set",
        password: password,
        passwordSetAt: nowIso()
      })
    };
  }

  function validatePasswordRules(password) {
    var errors = [];
    var p = password || "";
    if (!p) {
      errors.push("Enter a new password.");
      return errors;
    }
    if (p.length < 8) errors.push("Use a longer password.");
    if (!/[0-9]/.test(p)) errors.push("Include at least one number (0-9).");
    if (!/[A-Z]/.test(p)) errors.push("Include at least one uppercase letter (A-Z).");
    if (!/[a-z]/.test(p)) errors.push("Include at least one lowercase letter (a-z).");
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p)) {
      errors.push("Include at least one symbol, such as ! or #.");
    }
    return errors;
  }

  function authenticate(username, password) {
    var state = get();
    var user = (username || "").trim();
    var pass = password || "";

    if (user === "payeradmin" && pass === "Test@123") {
      return { ok: true, role: "payer-admin", user: user };
    }

    if (state.status === "password_set" && state.password &&
        (user === state.username || user === state.email) && pass === state.password) {
      return {
        ok: true,
        role: "agent",
        user: state.username,
        email: state.email,
        name: (state.firstName + " " + state.lastName).trim()
      };
    }

    return { ok: false, reason: "invalid" };
  }

  function siteOrigin() {
    try {
      if (location.protocol.indexOf("http") === 0) {
        return location.origin;
      }
    } catch (e) { /* ignore */ }
    return "";
  }

  function emailPath(file, query) {
    var path = "/email-templates/" + file + (query || "");
    var origin = siteOrigin();
    return origin ? origin + path : ".." + path;
  }

  function invitationEmailUrl(token) {
    var t = token || get().invitationToken || "mock-invitation-token";
    return emailPath("agent-invitation.html", "?token=" + encodeURIComponent(t));
  }

  function accountCreatedEmailUrl(token) {
    var t = token || get().passwordToken || "mock-password-token";
    // Use the Set Password email from the email-templates branch
    return emailPath("password-reset.html", "?token=" + encodeURIComponent(t));
  }

  function accountCreatedBriefEmailUrl(token) {
    var t = token || get().passwordToken || "mock-password-token";
    return emailPath("set-password-brief.html", "?token=" + encodeURIComponent(t));
  }

  function openEmailPreview(url) {
    var target = url;
    var inIframe = false;
    var topWin = window;
    try {
      inIframe = window.top && window.top !== window;
      if (inIframe) topWin = window.top;
    } catch (e) {
      inIframe = true;
    }

    // Inside the carrier portal iframe, navigate the top window.
    // Popup blockers often block window.open from iframes even on click.
    if (inIframe) {
      try {
        topWin.location.assign(target);
        return true;
      } catch (e2) {
        location.assign(target);
        return true;
      }
    }

    // Standalone page: prefer new tab, then same-tab fallback
    var opened = null;
    try {
      opened = window.open(target, "_blank");
    } catch (e3) {
      opened = null;
    }
    if (!opened || opened.closed) {
      location.assign(target);
      return false;
    }
    return true;
  }

  function acceptPageUrl(token, demo) {
    var t = token || get().invitationToken || "mock-invitation-token";
    var url = "accept-invitation.html?token=" + encodeURIComponent(t);
    if (demo || isDemoMode()) url += "&demo=1";
    return url;
  }

  function setPasswordPageUrl(token) {
    var t = token || get().passwordToken || "mock-password-token";
    return "set-password.html?token=" + encodeURIComponent(t);
  }

  global.EAAccountCreation = {
    STORAGE_KEY: STORAGE_KEY,
    DEFAULTS: DEFAULTS,
    get: get,
    update: update,
    resetDemo: resetDemo,
    setDemoMode: setDemoMode,
    isDemoMode: isDemoMode,
    createInvitation: createInvitation,
    acceptInvitation: acceptInvitation,
    completeAccountCreation: completeAccountCreation,
    setPassword: setPassword,
    findByInviteToken: findByInviteToken,
    findByPasswordToken: findByPasswordToken,
    validatePasswordRules: validatePasswordRules,
    authenticate: authenticate,
    invitationEmailUrl: invitationEmailUrl,
    accountCreatedEmailUrl: accountCreatedEmailUrl,
    accountCreatedBriefEmailUrl: accountCreatedBriefEmailUrl,
    openEmailPreview: openEmailPreview,
    acceptPageUrl: acceptPageUrl,
    setPasswordPageUrl: setPasswordPageUrl,
    makeUsername: makeUsername
  };
})(window);

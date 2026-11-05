/**
 * Sidebar role switcher - move between portals the user can access.
 */
(function () {
  var switcher = document.getElementById("roleSwitch");
  if (!switcher) return;

  var trigger = document.getElementById("roleSwitchTrigger");
  var panel = document.getElementById("roleSwitchPanel");
  if (!trigger || !panel) return;

  var ROLES = [
    {
      id: "payer-admin",
      label: "Payer Admin",
      hint: "Carrier operations and admin tools",
      icon: "fa-shield-alt",
      href: "landing-carrier.html"
    },
    {
      id: "agency-admin",
      label: "Agency Admin",
      hint: "Agency hierarchy and recruiting",
      icon: "fa-building",
      href: "landing-agency-admin.html"
    },
    {
      id: "agent",
      label: "Agent",
      hint: "Producer workspace and onboarding",
      icon: "fa-user-tie",
      href: "landing-agent.html"
    },
    {
      id: "member",
      label: "Member",
      hint: "Coverage and member self-service",
      icon: "fa-user",
      href: "landing-member.html"
    }
  ];

  var currentId = switcher.getAttribute("data-current") || "";
  var current = ROLES.filter(function (role) {
    return role.id === currentId;
  })[0] || ROLES[0];

  function setOpen(open) {
    switcher.classList.toggle("is-open", !!open);
    trigger.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) panel.removeAttribute("hidden");
    else panel.setAttribute("hidden", "");
  }

  function render() {
    var iconEl = trigger.querySelector("[data-role-icon]");
    var labelEl = trigger.querySelector("[data-role-label]");
    if (iconEl) iconEl.className = "fas " + current.icon;
    if (labelEl) labelEl.textContent = current.label;
    trigger.setAttribute(
      "aria-label",
      "Switch role, current role " + current.label
    );

    panel.innerHTML =
      '<p class="p-role-switch-caption">Switch role</p>' +
      ROLES.map(function (role) {
        var active = role.id === current.id;
        return (
          '<a class="p-role-option' +
          (active ? " is-current" : "") +
          '" href="' +
          role.href +
          '" data-role-id="' +
          role.id +
          '" role="menuitem"' +
          (active ? ' aria-current="page"' : "") +
          ">" +
          '<span class="p-role-option-ico" aria-hidden="true"><i class="fas ' +
          role.icon +
          '"></i></span>' +
          '<span class="p-role-option-copy">' +
          '<span class="p-role-option-label">' +
          role.label +
          "</span>" +
          '<span class="p-role-option-hint">' +
          role.hint +
          "</span>" +
          "</span>" +
          (active
            ? '<i class="fas fa-check p-role-option-check" aria-hidden="true"></i>'
            : "") +
          "</a>"
        );
      }).join("");
  }

  trigger.addEventListener("click", function (event) {
    event.stopPropagation();
    if (
      typeof window.portalExpandSidebar === "function" &&
      document.getElementById("appShell") &&
      document.getElementById("appShell").classList.contains("sidebar-collapsed")
    ) {
      window.portalExpandSidebar();
    }
    setOpen(!(switcher.classList.contains("is-open")));
  });

  panel.addEventListener("click", function (event) {
    event.stopPropagation();
  });

  document.addEventListener("click", function () {
    if (switcher.classList.contains("is-open")) setOpen(false);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && switcher.classList.contains("is-open")) {
      setOpen(false);
      trigger.focus();
    }
  });

  render();
  setOpen(false);
})();

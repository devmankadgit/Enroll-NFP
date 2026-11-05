(function () {
  var shell = document.getElementById('appShell');
  var toggle = document.getElementById('sidebarToggle');
  var closeBtn = document.getElementById('sidebarClose');
  var backdrop = document.getElementById('sidebarBackdrop');
  var rail = document.getElementById('sidebarRail');
  var userMenu = document.getElementById('userMenu');
  var userTrigger = document.getElementById('userMenuTrigger');
  var userPanel = document.getElementById('userMenuPanel');

  function isMobile() {
    return window.matchMedia('(max-width: 768px)').matches;
  }

  function setSidebarOpen(open) {
    if (!shell) return;
    shell.classList.toggle('sidebar-open', !!open);
    if (toggle) {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }
    document.body.style.overflow = open && isMobile() ? 'hidden' : '';
  }

  function setSidebarCollapsed(collapsed) {
    if (!shell || isMobile()) return;
    shell.classList.toggle('sidebar-collapsed', !!collapsed);
    if (rail) {
      rail.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      rail.setAttribute('aria-label', collapsed ? 'Expand sidebar' : 'Collapse sidebar');
      rail.setAttribute('title', collapsed ? 'Expand sidebar' : 'Collapse sidebar');
    }
  }

  window.portalExpandSidebar = function () {
    setSidebarCollapsed(false);
  };

  if (toggle) toggle.addEventListener('click', function () {
    setSidebarOpen(!(shell && shell.classList.contains('sidebar-open')));
  });
  if (closeBtn) closeBtn.addEventListener('click', function () { setSidebarOpen(false); });
  if (backdrop) backdrop.addEventListener('click', function () { setSidebarOpen(false); });
  if (rail) {
    rail.addEventListener('click', function () {
      setSidebarCollapsed(!(shell && shell.classList.contains('sidebar-collapsed')));
    });
  }
  window.addEventListener('resize', function () {
    if (isMobile()) setSidebarCollapsed(false);
  });

  function setUserOpen(open) {
    if (!userMenu || !userTrigger || !userPanel) return;
    userMenu.classList.toggle('is-open', !!open);
    userTrigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) userPanel.removeAttribute('hidden');
    else userPanel.setAttribute('hidden', '');
  }

  if (userTrigger) {
    userTrigger.addEventListener('click', function (e) {
      e.stopPropagation();
      setUserOpen(!(userMenu && userMenu.classList.contains('is-open')));
    });
  }
  document.addEventListener('click', function (e) {
    if (!userMenu || !userMenu.classList.contains('is-open')) return;
    if (!userMenu.contains(e.target)) setUserOpen(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      setSidebarOpen(false);
      setUserOpen(false);
    }
  });
})();

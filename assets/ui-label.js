/**
 * EnrollAxis - field label helpers
 * Truncation is CSS (.ui-label ellipsis). Set title so hover shows the full name.
 */
(function () {
  function fullLabelText(el) {
    return (el.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function enhance(el) {
    if (!el || el.nodeType !== 1) return;
    var full = fullLabelText(el);
    if (!full) return;
    if (!el.getAttribute('title')) el.setAttribute('title', full);
  }

  function init(scope) {
    (scope || document).querySelectorAll('label.ui-label').forEach(enhance);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { init(); });
  } else {
    init();
  }

  window.uiLabel = { init: init, enhance: enhance };
})();

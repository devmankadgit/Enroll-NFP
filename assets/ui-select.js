/**
 * EnrollAxis — shadcn-style Select enhancer
 * Progressive enhancement for <select class="ui-select">.
 */
(function () {
  var CHEVRON =
    '<svg class="ui-select-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
  var CHECK =
    '<svg class="ui-select-item-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

  function optionValue(opt) {
    if (!opt) return '';
    return opt.hasAttribute('value') ? opt.value : opt.textContent;
  }

  function closeAll(except) {
    document.querySelectorAll('.ui-select-root.is-open').forEach(function (root) {
      if (except && root === except) return;
      root.classList.remove('is-open');
      var trigger = root.querySelector('.ui-select-trigger');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    });
  }

  function syncFromNative(root) {
    var native = root._native;
    var valueEl = root.querySelector('.ui-select-value');
    var items = root.querySelectorAll('.ui-select-item');
    var selected = native.options[native.selectedIndex];
    var isPlaceholder = !selected || (selected.disabled && optionValue(selected) === '');

    if (!selected || isPlaceholder) {
      var placeholder =
        (selected && selected.disabled && selected.textContent) ||
        root.getAttribute('data-placeholder') ||
        'Select...';
      valueEl.textContent = placeholder;
      valueEl.classList.add('is-placeholder');
    } else {
      valueEl.textContent = selected.textContent;
      valueEl.classList.remove('is-placeholder');
    }

    var current = optionValue(selected);
    items.forEach(function (item) {
      var match = item.getAttribute('data-value') === current && !item.hasAttribute('aria-disabled');
      item.setAttribute('aria-selected', match ? 'true' : 'false');
      item.classList.toggle('is-highlighted', false);
    });
  }

  function enhance(native) {
    if (!native || native.dataset.uiSelectEnhanced === '1') return;
    native.dataset.uiSelectEnhanced = '1';

    var root = document.createElement('div');
    root.className = 'ui-select-root';
    if (native.disabled) root.classList.add('is-disabled');

    var listId = (native.id || 'select') + '-listbox';
    var trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'ui-select-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', listId);
    if (native.id) trigger.id = native.id + '-trigger';
    if (native.disabled) trigger.disabled = true;

    var valueEl = document.createElement('span');
    valueEl.className = 'ui-select-value is-placeholder';
    trigger.appendChild(valueEl);
    trigger.insertAdjacentHTML('beforeend', CHEVRON);

    var content = document.createElement('div');
    content.className = 'ui-select-content';
    content.id = listId;
    content.setAttribute('role', 'listbox');
    if (native.id) content.setAttribute('aria-labelledby', native.id + '-trigger');

    Array.prototype.forEach.call(native.options, function (opt, index) {
      if (opt.disabled && optionValue(opt) === '' && opt.selected) {
        root.setAttribute('data-placeholder', opt.textContent);
      }
      if (opt.disabled && optionValue(opt) === '') return;

      var item = document.createElement('button');
      item.type = 'button';
      item.className = 'ui-select-item';
      item.setAttribute('role', 'option');
      item.setAttribute('data-value', optionValue(opt));
      item.setAttribute('data-index', String(index));
      item.setAttribute('aria-selected', 'false');
      if (opt.disabled) item.setAttribute('aria-disabled', 'true');

      var label = document.createElement('span');
      label.textContent = opt.textContent;
      item.appendChild(label);
      item.insertAdjacentHTML('beforeend', CHECK);

      item.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (opt.disabled) return;
        native.selectedIndex = index;
        native.dispatchEvent(new Event('change', { bubbles: true }));
        syncFromNative(root);
        closeAll();
        trigger.focus();
      });

      item.addEventListener('mouseenter', function () {
        content.querySelectorAll('.ui-select-item').forEach(function (el) {
          el.classList.remove('is-highlighted');
        });
        item.classList.add('is-highlighted');
      });

      content.appendChild(item);
    });

    native.classList.add('ui-select-native');
    native.classList.remove('ui-select');
    native.setAttribute('aria-hidden', 'true');
    native.setAttribute('tabindex', '-1');
    if (native.id) {
      document.querySelectorAll('label[for="' + native.id + '"]').forEach(function (lab) {
        lab.setAttribute('for', native.id + '-trigger');
      });
    }
    native.parentNode.insertBefore(root, native);
    root.appendChild(native);
    root.appendChild(trigger);
    root.appendChild(content);
    root._native = native;

    function open() {
      if (native.disabled) return;
      closeAll(root);
      document.querySelectorAll('.ui-date-root.is-open').forEach(function (dateRoot) {
        dateRoot.classList.remove('is-open');
        var t = dateRoot.querySelector('.ui-date-trigger');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
      root.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      var selectedItem = content.querySelector('.ui-select-item[aria-selected="true"]');
      content.querySelectorAll('.ui-select-item').forEach(function (el) {
        el.classList.remove('is-highlighted');
      });
      if (selectedItem) selectedItem.classList.add('is-highlighted');
    }

    function toggle() {
      if (root.classList.contains('is-open')) closeAll();
      else open();
    }

    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggle();
    });

    trigger.addEventListener('keydown', function (e) {
      var items = Array.prototype.slice.call(
        content.querySelectorAll('.ui-select-item:not([aria-disabled="true"])')
      );
      if (!items.length) return;

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!root.classList.contains('is-open')) {
          open();
          return;
        }
        var current = content.querySelector('.ui-select-item.is-highlighted') || items[0];
        var idx = items.indexOf(current);
        var next =
          e.key === 'ArrowDown'
            ? items[Math.min(items.length - 1, idx + 1)]
            : items[Math.max(0, idx - 1)];
        items.forEach(function (el) { el.classList.remove('is-highlighted'); });
        next.classList.add('is-highlighted');
        next.scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!root.classList.contains('is-open')) {
          open();
          return;
        }
        var highlighted = content.querySelector('.ui-select-item.is-highlighted');
        if (highlighted) highlighted.click();
      } else if (e.key === 'Escape') {
        if (root.classList.contains('is-open')) {
          e.preventDefault();
          closeAll();
        }
      }
    });

    native.addEventListener('change', function () {
      syncFromNative(root);
    });

    // Keep disabled state in sync if toggled later
    var mo = new MutationObserver(function () {
      root.classList.toggle('is-disabled', native.disabled);
      trigger.disabled = native.disabled;
    });
    mo.observe(native, { attributes: true, attributeFilter: ['disabled'] });

    syncFromNative(root);
  }

  function init(scope) {
    (scope || document).querySelectorAll('select.ui-select').forEach(enhance);
  }

  document.addEventListener('click', function () { closeAll(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAll();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { init(); });
  } else {
    init();
  }

  window.uiSelect = { init: init, enhance: enhance };
})();

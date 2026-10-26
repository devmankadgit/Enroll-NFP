/**
 * EnrollAxis — shadcn-style Date Picker (Popover + Calendar)
 * Progressive enhancement for <input class="ui-input" type="date">.
 */
(function () {
  var MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  var WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  var ICON_CAL =
    '<svg class="ui-date-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>';
  var ICON_PREV =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>';
  var ICON_NEXT =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>';

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function toISO(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function parseISO(iso) {
    if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
    var p = iso.split('-').map(Number);
    var d = new Date(p[0], p[1] - 1, p[2]);
    if (d.getFullYear() !== p[0] || d.getMonth() !== p[1] - 1 || d.getDate() !== p[2]) return null;
    return d;
  }

  function formatDisplay(iso) {
    var d = parseISO(iso);
    if (!d) return '';
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  function sameDay(a, b) {
    return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  function closeAll(except) {
    document.querySelectorAll('.ui-date-root.is-open').forEach(function (root) {
      if (except && root === except) return;
      root.classList.remove('is-open');
      var trigger = root.querySelector('.ui-date-trigger');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    });
  }

  function closeSelects() {
    document.querySelectorAll('.ui-select-root.is-open').forEach(function (root) {
      root.classList.remove('is-open');
      var trigger = root.querySelector('.ui-select-trigger');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    });
  }

  function enhance(native) {
    if (!native || native.dataset.uiDateEnhanced === '1') return;
    if (native.type !== 'date') return;
    native.dataset.uiDateEnhanced = '1';

    var root = document.createElement('div');
    root.className = 'ui-date-root';
    if (native.disabled) root.classList.add('is-disabled');

    var popId = (native.id || 'date') + '-calendar';
    var trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'ui-date-trigger';
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', popId);
    if (native.id) trigger.id = native.id + '-trigger';
    if (native.disabled) trigger.disabled = true;

    var valueEl = document.createElement('span');
    valueEl.className = 'ui-date-value is-placeholder';
    valueEl.textContent = 'Pick a date';
    trigger.appendChild(valueEl);
    trigger.insertAdjacentHTML('beforeend', ICON_CAL);

    var popover = document.createElement('div');
    popover.className = 'ui-date-popover';
    popover.id = popId;
    popover.setAttribute('role', 'dialog');
    popover.setAttribute('aria-label', 'Choose date');

    var calendar = document.createElement('div');
    calendar.className = 'ui-calendar';
    popover.appendChild(calendar);

    native.classList.add('ui-date-native');
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
    root.appendChild(popover);
    root._native = native;

    var view = parseISO(native.value) || new Date();
    view = new Date(view.getFullYear(), view.getMonth(), 1);

    function syncTrigger() {
      if (native.value) {
        valueEl.textContent = formatDisplay(native.value);
        valueEl.classList.remove('is-placeholder');
      } else {
        valueEl.textContent = 'Pick a date';
        valueEl.classList.add('is-placeholder');
      }
    }

    function render() {
      var selected = parseISO(native.value);
      var today = new Date();
      var y = view.getFullYear();
      var m = view.getMonth();
      var first = new Date(y, m, 1);
      var startPad = first.getDay();
      var daysInMonth = new Date(y, m + 1, 0).getDate();
      var prevDays = new Date(y, m, 0).getDate();

      var yearNow = today.getFullYear();
      var yearOpts = '';
      for (var yr = yearNow - 100; yr <= yearNow + 25; yr++) {
        yearOpts += '<option value="' + yr + '"' + (yr === y ? ' selected' : '') + '>' + yr + '</option>';
      }
      var monthOpts = MONTHS.map(function (name, i) {
        return '<option value="' + i + '"' + (i === m ? ' selected' : '') + '>' + name + '</option>';
      }).join('');

      var html = '';
      html += '<div class="ui-cal-header">';
      html += '<button type="button" class="ui-cal-nav" data-cal-nav="prev" aria-label="Previous month">' + ICON_PREV + '</button>';
      html += '<div class="ui-cal-captions">';
      html += '<select class="ui-cal-caption-select" data-cal-month aria-label="Month">' + monthOpts + '</select>';
      html += '<select class="ui-cal-caption-select" data-cal-year aria-label="Year">' + yearOpts + '</select>';
      html += '</div>';
      html += '<button type="button" class="ui-cal-nav" data-cal-nav="next" aria-label="Next month">' + ICON_NEXT + '</button>';
      html += '</div>';

      html += '<div class="ui-cal-weekdays">';
      WEEKDAYS.forEach(function (d) {
        html += '<div class="ui-cal-weekday">' + d + '</div>';
      });
      html += '</div>';

      html += '<div class="ui-cal-grid">';
      var cells = [];
      for (var i = 0; i < startPad; i++) {
        var pd = prevDays - startPad + i + 1;
        cells.push({ day: pd, outside: true, date: new Date(y, m - 1, pd) });
      }
      for (var d = 1; d <= daysInMonth; d++) {
        cells.push({ day: d, outside: false, date: new Date(y, m, d) });
      }
      while (cells.length % 7 !== 0) {
        var nd = cells.length - (startPad + daysInMonth) + 1;
        cells.push({ day: nd, outside: true, date: new Date(y, m + 1, nd) });
      }
      cells.forEach(function (cell) {
        var iso = toISO(cell.date);
        var cls = 'ui-cal-day';
        if (cell.outside) cls += ' is-outside';
        if (sameDay(cell.date, today)) cls += ' is-today';
        if (selected && sameDay(cell.date, selected)) cls += ' is-selected';
        html += '<button type="button" class="' + cls + '" data-iso="' + iso + '" aria-label="' + formatDisplay(iso) + '">' + cell.day + '</button>';
      });
      html += '</div>';

      calendar.innerHTML = html;
    }

    function open() {
      if (native.disabled) return;
      closeAll(root);
      closeSelects();
      var selected = parseISO(native.value);
      if (selected) view = new Date(selected.getFullYear(), selected.getMonth(), 1);
      render();
      root.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
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

    popover.addEventListener('click', function (e) {
      e.stopPropagation();
      var nav = e.target.closest('[data-cal-nav]');
      if (nav) {
        var dir = nav.getAttribute('data-cal-nav');
        view = new Date(view.getFullYear(), view.getMonth() + (dir === 'next' ? 1 : -1), 1);
        render();
        return;
      }
      var dayBtn = e.target.closest('.ui-cal-day');
      if (dayBtn) {
        native.value = dayBtn.getAttribute('data-iso');
        native.dispatchEvent(new Event('change', { bubbles: true }));
        syncTrigger();
        closeAll();
        trigger.focus();
      }
    });

    popover.addEventListener('change', function (e) {
      var t = e.target;
      if (t.matches('[data-cal-month]')) {
        view = new Date(view.getFullYear(), Number(t.value), 1);
        render();
      } else if (t.matches('[data-cal-year]')) {
        view = new Date(Number(t.value), view.getMonth(), 1);
        render();
      }
    });

    native.addEventListener('change', syncTrigger);

    var mo = new MutationObserver(function () {
      root.classList.toggle('is-disabled', native.disabled);
      trigger.disabled = native.disabled;
    });
    mo.observe(native, { attributes: true, attributeFilter: ['disabled'] });

    syncTrigger();
  }

  function init(scope) {
    (scope || document).querySelectorAll('input.ui-input[type="date"]').forEach(enhance);
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

  window.uiCalendar = { init: init, enhance: enhance };
})();

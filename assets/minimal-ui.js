/**
 * EnrollAxis - Minimal-style UI behaviours (static prototype)
 * MX.toast, MX.dialog, MX.form (validation + masks), MX.dropzone, MX.ring, MX.popover.
 * Needs minimal-icons.js (window.mxIcon) loaded first.
 */
(function () {
  var MX = window.MX = window.MX || {};
  var ic = function (n, c) { return window.mxIcon ? window.mxIcon(n, c) : ''; };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  MX.esc = esc;

  /* ---------------- Toast ---------------- */
  var TOAST_ICON = { success: 'check-circle-bold', error: 'danger-circle-bold', warning: 'danger-triangle-bold', info: 'info-circle-bold', primary: 'cloud-check-bold-duotone' };
  function toaster() {
    var t = document.getElementById('mxToaster');
    if (!t) {
      t = document.createElement('div');
      t.id = 'mxToaster';
      t.className = 'mx-toaster';
      t.setAttribute('aria-live', 'polite');
      t.setAttribute('role', 'status');
      document.body.appendChild(t);
    }
    return t;
  }
  /** MX.toast({ type, title, message, action: { label, onClick }, duration }) */
  MX.toast = function (opts) {
    if (typeof opts === 'string') opts = { title: opts };
    var type = opts.type || 'info';
    var duration = opts.duration == null ? (type === 'error' ? 7000 : 4500) : opts.duration;
    var el = document.createElement('div');
    el.className = 'mx-toast mx-toast-' + type;
    if (type === 'error') el.setAttribute('role', 'alert');
    el.innerHTML =
      '<span class="mx-toast-icon">' + ic(opts.icon || TOAST_ICON[type]) + '</span>' +
      '<div class="mx-toast-body"><div class="mx-toast-title">' + esc(opts.title || '') + '</div>' +
      (opts.message ? '<div class="mx-toast-msg">' + esc(opts.message) + '</div>' : '') +
      (opts.action ? '<div class="mx-toast-action"><button type="button" class="mx-btn mx-btn-soft mx-btn-sm mx-btn-primary">' + esc(opts.action.label) + '</button></div>' : '') +
      '</div><button type="button" class="mx-icon-btn mx-icon-btn-sm" aria-label="Dismiss">' + ic('close-circle-bold') + '</button>' +
      (duration ? '<span class="mx-toast-bar" style="animation-duration:' + duration + 'ms"></span>' : '');
    var timer;
    function close() {
      clearTimeout(timer);
      el.classList.add('is-leaving');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 260);
    }
    el.querySelector('.mx-icon-btn').addEventListener('click', close);
    if (opts.action) el.querySelector('.mx-toast-action button').addEventListener('click', function () { opts.action.onClick(); close(); });
    var root = toaster();
    root.appendChild(el);
    while (root.children.length > 4) root.removeChild(root.firstChild);
    if (duration) {
      var left = duration, started = Date.now();
      var arm = function () { started = Date.now(); timer = setTimeout(close, left); };
      el.addEventListener('mouseenter', function () { clearTimeout(timer); left -= Date.now() - started; });
      el.addEventListener('mouseleave', arm);
      arm();
    }
    return { close: close };
  };

  /* ---------------- Dialog ---------------- */
  /** MX.dialog({ tone, icon, title, html, actions: [{ label, variant, value }] }) -> Promise<value|null> */
  MX.dialog = function (opts) {
    return new Promise(function (resolve) {
      var prev = document.activeElement;
      var tone = opts.tone || 'primary';
      var boxTone = { primary: '', warning: ' is-warning', error: ' is-error', success: ' is-success', info: ' is-info' }[tone] || '';
      var root = document.createElement('div');
      root.className = 'mx-dialog-root';
      root.innerHTML =
        '<div class="mx-dialog-backdrop"></div>' +
        '<div class="mx-dialog" role="dialog" aria-modal="true" aria-labelledby="mxDlgTitle">' +
        '<div class="mx-dialog-head">' + (opts.icon ? '<span class="mx-icon-box mx-icon-box-round' + boxTone + '"><span data-icon="' + opts.icon + '"></span></span>' : '') +
        '<div><h2 class="mx-h5" id="mxDlgTitle">' + esc(opts.title) + '</h2></div></div>' +
        '<div class="mx-dialog-content">' + (opts.html || esc(opts.message || '')) + '</div>' +
        '<div class="mx-dialog-actions"></div></div>';
      var actions = root.querySelector('.mx-dialog-actions');
      (opts.actions || [{ label: 'OK', variant: 'contained', value: true }]).forEach(function (a) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'mx-btn mx-btn-' + (a.variant || 'outlined') + ' ' + (a.color ? 'mx-btn-' + a.color : (a.variant === 'contained' ? 'mx-btn-primary' : 'mx-btn-neutral'));
        b.textContent = a.label;
        b.addEventListener('click', function () { done(a.value); });
        actions.appendChild(b);
      });
      function onKey(e) {
        if (e.key === 'Escape') done(null);
        if (e.key === 'Tab') {
          var f = root.querySelectorAll('button, a, input');
          if (!f.length) return;
          if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
          else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
        }
      }
      function done(v) {
        document.removeEventListener('keydown', onKey);
        if (root.parentNode) root.parentNode.removeChild(root);
        document.body.style.overflow = '';
        if (prev && prev.focus) prev.focus();
        resolve(v);
      }
      root.querySelector('.mx-dialog-backdrop').addEventListener('click', function () { if (!opts.persistent) done(null); });
      root.addEventListener('click', function (e) {
        var t = e.target.closest('[data-dialog-value]');
        if (t) { e.preventDefault(); done(t.getAttribute('data-dialog-value')); }
      });
      document.addEventListener('keydown', onKey);
      document.body.appendChild(root);
      document.body.style.overflow = 'hidden';
      if (window.MXIcons) MXIcons.render(root);
      var btns = actions.querySelectorAll('button');
      if (btns.length) btns[btns.length - 1].focus();
    });
  };

  /* ---------------- Masks ---------------- */
  var digits = function (v) { return String(v || '').replace(/\D/g, ''); };
  MX.digits = digits;
  var MASKS = {
    digits: function (v, el) { return digits(v).slice(0, +(el.getAttribute('maxlength') || 20)); },
    phone: function (v) {
      var raw = String(v || ''), d = digits(raw);
      if (/^\s*\+?1\b/.test(raw) && raw.replace(/\s/g, '').charAt(0) === '+') d = d.slice(1);
      else if (d.length === 11 && d.charAt(0) === '1') d = d.slice(1);
      d = d.slice(0, 10);
      if (d.length < 4) return d.length ? '(' + d : '';
      if (d.length < 7) return '(' + d.slice(0, 3) + ') ' + d.slice(3);
      return '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6);
    },
    /* MM/DD/YYYY. Accepts 03121985, 3/12/1985, 3-12-1985: a separator after one digit pads it with 0. */
    date: function (v) {
      var seg = ['', '', ''], i = 0, raw = String(v || '');
      for (var k = 0; k < raw.length; k++) {
        var ch = raw.charAt(k);
        if (/\d/.test(ch)) {
          if (i < 2 && seg[i].length === 2) i++;
          if (i === 2 && seg[2].length === 4) break;
          seg[i] += ch;
        } else if (i < 2 && seg[i].length) {
          if (seg[i].length === 1) seg[i] = '0' + seg[i];
          i++;
        }
      }
      return seg[0] + (i >= 1 ? '/' + seg[1] : '') + (i >= 2 ? '/' + seg[2] : '');
    },
    ssn: function (v) {
      var d = digits(v).slice(0, 9);
      if (d.length < 4) return d;
      if (d.length < 6) return d.slice(0, 3) + '-' + d.slice(3);
      return d.slice(0, 3) + '-' + d.slice(3, 5) + '-' + d.slice(5);
    },
    ein: function (v) {
      var d = digits(v).slice(0, 9);
      return d.length < 3 ? d : d.slice(0, 2) + '-' + d.slice(2);
    },
    ahip: function (v) {
      var s = String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (s.indexOf('AH') !== 0) s = 'AH' + s.replace(/^A?H?/, '');
      var rest = s.slice(2).replace(/\D/g, '').slice(0, 9);
      if (!rest.length) return v ? 'AH' : '';
      return 'AH' + rest.slice(0, 4) + (rest.length > 4 ? '-' + rest.slice(4) : '');
    }
  };
  MX.applyMask = function (el) {
    var m = MASKS[el.getAttribute('data-mask')];
    if (!m) return;
    var before = el.value;
    var atEnd = el.selectionStart === before.length;
    var next = m(before, el);
    if (next !== before) {
      el.value = next;
      if (atEnd) try { el.setSelectionRange(next.length, next.length); } catch (e) { /* type without selection */ }
    }
  };

  /* ---------------- Validation ---------------- */
  function parseUSDate(s) {
    var m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s || '');
    if (!m) return null;
    var d = new Date(+m[3], +m[1] - 1, +m[2]);
    if (d.getFullYear() !== +m[3] || d.getMonth() !== +m[1] - 1 || d.getDate() !== +m[2]) return null;
    return d;
  }
  MX.parseUSDate = parseUSDate;
  MX.formatUSDate = function (d) {
    var p = function (n) { return n < 10 ? '0' + n : '' + n; };
    return p(d.getMonth() + 1) + '/' + p(d.getDate()) + '/' + d.getFullYear();
  };
  function abaValid(r) {
    if (!/^\d{9}$/.test(r)) return false;
    var n = r.split('').map(Number);
    return (3 * (n[0] + n[3] + n[6]) + 7 * (n[1] + n[4] + n[7]) + (n[2] + n[5] + n[8])) % 10 === 0;
  }
  MX.abaValid = abaValid;

  /* Each rule: (value, el, arg) -> error string or '' */
  var RULES = {
    required: function (v, el) {
      if (String(v).trim()) return '';
      return (el.getAttribute('data-required-msg')) || ('Enter your ' + lower(label(el)) + '.');
    },
    name: function (v) { return !v || /^[A-Za-z][A-Za-z .'-]*$/.test(v.trim()) ? '' : 'Use letters, spaces, hyphens or apostrophes only.'; },
    min: function (v, el, n) { return !v || v.trim().length >= +n ? '' : 'Must be at least ' + n + ' characters.'; },
    npn: function (v) { var d = digits(v); return !v || (d.length >= 6 && d.length <= 10) ? '' : 'An NPN is 6 to 10 digits. Check your NIPR record.'; },
    phone: function (v) { return !v || digits(v).length === 10 ? '' : 'Enter a 10-digit US phone number.'; },
    email: function (v) { return !v || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Enter a valid email address, like name@agency.com.'; },
    zip: function (v) { return !v || /^\d{5}$/.test(v) ? '' : 'ZIP code must be 5 digits.'; },
    date: function (v) {
      if (!v || parseUSDate(v)) return '';
      return /^\d{2}\/\d{2}\/\d{2}$/.test(v) ? 'Use a 4-digit year, like 1985.' : 'Enter a real date as MM/DD/YYYY.';
    },
    past: function (v) { var d = parseUSDate(v); return !d || d <= new Date() ? '' : 'This date cannot be in the future.'; },
    adult: function (v) {
      var d = parseUSDate(v);
      if (!d) return '';
      var now = new Date(), age = now.getFullYear() - d.getFullYear();
      if (now < new Date(now.getFullYear(), d.getMonth(), d.getDate())) age--;
      if (age < 18) return 'You must be at least 18 to be appointed as an agent.';
      if (age > 100) return 'Check the year. This date is more than 100 years ago.';
      return '';
    },
    ssn: function (v) {
      var d = digits(v);
      if (!v) return '';
      if (d.length !== 9) return 'SSN must be 9 digits (XXX-XX-XXXX).';
      if (/^(000|666|9)/.test(d) || d.slice(3, 5) === '00' || d.slice(5) === '0000') return 'This is not a valid SSN. Check the number on your card.';
      return '';
    },
    ein: function (v) { return !v || digits(v).length === 9 ? '' : 'EIN must be 9 digits (XX-XXXXXXX).'; },
    routing: function (v) {
      if (!v) return '';
      if (digits(v).length !== 9) return 'Routing number must be 9 digits.';
      return abaValid(digits(v)) ? '' : 'This routing number is not valid. Check the first 9 digits at the bottom of a check.';
    },
    account: function (v) { var d = digits(v); return !v || (d.length >= 4 && d.length <= 17) ? '' : 'Account number must be 4 to 17 digits.'; },
    match: function (v, el, otherId) {
      var o = document.getElementById(otherId);
      return !v || !o || digits(o.value) === digits(v) ? '' : 'Account numbers do not match.';
    },
    ahip: function (v) { return !v || /^AH\d{4}-\d{5}$/.test(v) ? '' : 'Use the format on your certificate, like AH2026-12345.'; }
  };
  MX.rules = RULES;
  function label(el) {
    if (el.getAttribute('data-label')) return el.getAttribute('data-label');
    var l = el.id && document.querySelector('label[for="' + el.id + '"]');
    return l ? l.textContent.replace('*', '').trim() : 'this field';
  }
  function lower(s) { return /^[A-Z]{2,}/.test(s) ? s : s.charAt(0).toLowerCase() + s.slice(1); }
  MX.fieldLabel = label;

  function fieldOf(el) { return el.closest('.mx-field'); }
  function ensureErrorEl(el) {
    var f = fieldOf(el);
    if (!f) return null;
    var e = f.querySelector('.mx-helper-error');
    if (!e) {
      e = document.createElement('p');
      e.className = 'mx-helper mx-helper-error';
      e.id = el.id + '-error';
      f.appendChild(e);
    }
    return e;
  }
  /** Set or clear an error on a field. Returns the message. */
  MX.setFieldError = function (el, msg) {
    var f = fieldOf(el);
    if (!f) return msg;
    var e = ensureErrorEl(el);
    f.classList.toggle('is-invalid', !!msg);
    if (msg) {
      e.innerHTML = ic('danger-circle-bold') + '<span>' + esc(msg) + '</span>';
      el.setAttribute('aria-invalid', 'true');
      var ids = (el.getAttribute('aria-describedby') || '').split(' ').filter(function (x) { return x && x !== e.id; });
      ids.unshift(e.id);
      el.setAttribute('aria-describedby', ids.join(' '));
      f.classList.remove('is-valid');
    } else {
      el.removeAttribute('aria-invalid');
    }
    return msg;
  };
  /** Validate one input against its data-rules. Shows/clears the error. */
  MX.validateField = function (el, opts) {
    if (!el || el.disabled || el.closest('[hidden]')) return '';
    var rules = (el.getAttribute('data-rules') || '').split('|').filter(Boolean);
    var v = el.value || '';
    var msg = '';
    for (var i = 0; i < rules.length && !msg; i++) {
      var parts = rules[i].split(':');
      var fn = RULES[parts[0]];
      if (fn) msg = fn(v, el, parts[1]);
    }
    if (!msg && el._mxCustom) msg = el._mxCustom(v, el) || '';
    MX.setFieldError(el, msg);
    var f = fieldOf(el);
    if (f) {
      f.classList.toggle('is-valid', !msg && !!String(v).trim() && el.hasAttribute('data-show-valid'));
      f.classList.toggle('is-filled', !!String(v).trim());
      if (msg && opts && opts.shake) {
        f.classList.remove('is-shake');
        void f.offsetWidth;
        f.classList.add('is-shake');
      }
    }
    return msg;
  };
  /** Attach a custom validator (runs after data-rules). */
  MX.customRule = function (el, fn) { if (el) el._mxCustom = fn; };

  /** Validate every [data-rules] input inside root. Returns [{ el, label, message }] */
  MX.validateAll = function (root) {
    var errs = [];
    root.querySelectorAll('[data-rules]').forEach(function (el) {
      el._mxTouched = true;
      var m = MX.validateField(el, { shake: true });
      if (m) errs.push({ el: el, label: label(el), message: m });
    });
    return errs;
  };

  /** Wire blur/input validation + masks for every field in root (idempotent). */
  MX.bindForm = function (root) {
    (root || document).querySelectorAll('.mx-input').forEach(function (el) {
      if (el._mxBound) return;
      el._mxBound = true;
      var f = fieldOf(el);
      if (f && el.value) f.classList.add('is-filled');
      el.addEventListener('input', function () {
        if (el.hasAttribute('data-mask')) MX.applyMask(el);
        if (f) f.classList.toggle('is-filled', !!el.value);
        if (el._mxTouched) MX.validateField(el);
        else if (f && f.classList.contains('is-invalid')) MX.validateField(el);
      });
      el.addEventListener('blur', function () {
        if (!el.value && !el._mxTouched) return; /* do not shout at people who just tab through */
        el._mxTouched = true;
        MX.validateField(el);
      });
    });
    (root || document).querySelectorAll('[data-toggle-visibility]').forEach(function (btn) {
      if (btn._mxBound) return;
      btn._mxBound = true;
      btn.addEventListener('click', function () {
        var input = document.getElementById(btn.getAttribute('data-toggle-visibility'));
        var show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        btn.setAttribute('aria-label', show ? 'Hide value' : 'Show value');
        var i = btn.querySelector('[data-icon]');
        i.setAttribute('data-icon', show ? 'eye-closed-bold' : 'eye-bold');
        MXIcons.render(btn);
      });
    });
  };

  /** Set a value programmatically and refresh label + validation state. */
  MX.setValue = function (id, v) {
    var el = typeof id === 'string' ? document.getElementById(id) : id;
    if (!el) return;
    el.value = v;
    if (el.hasAttribute('data-mask')) MX.applyMask(el);
    var f = fieldOf(el);
    if (f) f.classList.toggle('is-filled', !!el.value);
    if (el._mxTouched || (f && f.classList.contains('is-invalid'))) MX.validateField(el);
    el.dispatchEvent(new Event('change', { bubbles: true }));
  };

  /* ---------------- Dropzone ---------------- */
  function fmtSize(b) { return b < 1024 * 1024 ? Math.max(1, Math.round(b / 1024)) + ' KB' : (b / 1024 / 1024).toFixed(1) + ' MB'; }
  MX.fmtSize = fmtSize;
  /**
   * MX.dropzone(zoneEl, { accept: ['pdf'], maxMB: 5, list: el, onChange(fileInfo|null), label })
   * Validates type + size, shows an animated upload row with remove action.
   */
  MX.dropzone = function (zone, opts) {
    var input = zone.querySelector('input[type=file]');
    var list = opts.list;
    var errEl = opts.errorEl;
    function showErr(msg) {
      zone.classList.toggle('is-invalid', !!msg);
      if (errEl) {
        errEl.innerHTML = msg ? ic('danger-circle-bold') + '<span>' + esc(msg) + '</span>' : '';
        errEl.classList.toggle('is-visible', !!msg);
      }
    }
    function render(info, uploading) {
      if (!info) { list.innerHTML = ''; zone.hidden = false; return; }
      zone.hidden = true;
      var isPdf = /\.pdf$/i.test(info.name);
      list.innerHTML = '<div class="mx-file-item"><span class="mx-file-thumb"' + (isPdf ? '' : ' style="background:var(--info-50);color:var(--info-600)"') + '>' + ic(isPdf ? 'file-text-bold-duotone' : 'document-text-bold-duotone') + '</span>' +
        '<div class="mx-file-meta"><div class="mx-file-name">' + esc(info.name) + '</div>' +
        (uploading ? '<div class="mx-file-progress"><span style="width:0%"></span></div>' : '<div class="mx-caption">' + esc(info.size) + ' &middot; <span style="color:var(--success-700);font-weight:600">Uploaded</span></div>') +
        '</div><button type="button" class="mx-icon-btn mx-icon-btn-sm" aria-label="Remove ' + esc(info.name) + '">' + ic('trash-bin-trash-bold') + '</button></div>';
      list.querySelector('button').addEventListener('click', function () {
        input.value = '';
        render(null);
        opts.onChange && opts.onChange(null);
        MX.toast({ type: 'info', title: 'File removed', message: info.name });
      });
    }
    function take(file) {
      if (!file) return;
      var ext = (file.name.split('.').pop() || '').toLowerCase();
      if (opts.accept && opts.accept.indexOf(ext) === -1) {
        input.value = '';
        return showErr('"' + file.name + '" is a .' + ext + ' file. Upload a ' + opts.accept.map(function (a) { return a.toUpperCase(); }).join(' or ') + ' file.');
      }
      if (opts.maxMB && file.size > opts.maxMB * 1024 * 1024) {
        input.value = '';
        return showErr('"' + file.name + '" is ' + fmtSize(file.size) + '. The limit is ' + opts.maxMB + ' MB. Try a smaller scan.');
      }
      showErr('');
      var info = { name: file.name, size: fmtSize(file.size) };
      render(info, true);
      var bar = list.querySelector('.mx-file-progress span'), p = 0;
      var t = setInterval(function () {
        p = Math.min(100, p + 18 + Math.random() * 22);
        if (bar) bar.style.width = p + '%';
        if (p >= 100) {
          clearInterval(t);
          render(info, false);
          opts.onChange && opts.onChange(info);
        }
      }, 140);
    }
    input.addEventListener('change', function () { take(input.files && input.files[0]); });
    ['dragenter', 'dragover'].forEach(function (ev) { zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.add('is-drag'); }); });
    ['dragleave', 'drop'].forEach(function (ev) { zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.remove('is-drag'); }); });
    zone.addEventListener('drop', function (e) { take(e.dataTransfer.files && e.dataTransfer.files[0]); });
    return {
      set: function (info) { showErr(''); render(info, false); },
      clear: function () { input.value = ''; render(null); },
      error: showErr
    };
  };

  /* ---------------- Progress ring ---------------- */
  /** Returns ring markup. size px, stroke px, pct 0-100, inner html */
  MX.ring = function (size, stroke, pct, inner, cls) {
    var r = (size - stroke) / 2, c = 2 * Math.PI * r;
    return '<div class="mx-ring' + (cls ? ' ' + cls : '') + '" style="width:' + size + 'px;height:' + size + 'px">' +
      '<svg width="' + size + '" height="' + size + '"><circle class="mx-ring-track" cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke-width="' + stroke + '"/>' +
      '<circle class="mx-ring-bar" cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke-width="' + stroke + '" stroke-dasharray="' + c + '" stroke-dashoffset="' + (c * (1 - Math.max(0, Math.min(100, pct)) / 100)) + '"/></svg>' +
      '<div class="mx-ring-value">' + (inner || '') + '</div></div>';
  };
  /** Update an existing ring in place (animates). */
  MX.setRing = function (ringEl, pct) {
    var bar = ringEl && ringEl.querySelector('.mx-ring-bar');
    if (!bar) return;
    var c = parseFloat(bar.getAttribute('stroke-dasharray'));
    bar.setAttribute('stroke-dashoffset', c * (1 - Math.max(0, Math.min(100, pct)) / 100));
  };

  /* ---------------- Popover ---------------- */
  MX.popover = function (trigger, pop) {
    function close() { pop.hidden = true; trigger.setAttribute('aria-expanded', 'false'); }
    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = pop.hidden;
      document.querySelectorAll('.mx-popover').forEach(function (p) { p.hidden = true; });
      pop.hidden = !open;
      trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) { if (!pop.contains(e.target)) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    return { close: close };
  };
})();

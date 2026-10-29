/**
 * EnrollAxis - Agent onboarding flow (static prototype)
 * Steps 0-7, NIPR lookup prefill, inline validation, autosave, training exams, review & sign.
 * Public API kept for capture scripts: obGoTo(n), obNext(n), obBack(n), skipStep(n), prefillStep(n).
 */
(function () {
  'use strict';

  var STORE_KEY = 'ea.agentOnboarding.v2';
  var TOTAL = 8;
  var STEPS = [
    { title: 'Get started', short: 'Start', caption: 'Invite and NPN', icon: 'rocket-2-bold-duotone', mins: 2,
      tips: ['Your NPN is on your NIPR record or your state license.', 'We use it to fill in your name, address and licenses for you.'] },
    { title: 'About you', short: 'About', caption: 'Identity and address', icon: 'user-id-bold-duotone', mins: 2,
      subtitle: 'Confirm your details. Most of them come straight from NIPR.',
      tips: ['Your name must match your state license exactly.', 'Use a business address. A home office is fine.'] },
    { title: 'Tax & payouts', short: 'Tax', caption: 'W-9 and bank', icon: 'wallet-money-bold-duotone', mins: 4,
      subtitle: 'Set up your W-9 and choose how commissions are paid.',
      tips: ['E-signing your W-9 is faster than uploading a scan.', 'Find the routing number at the bottom-left of a check.', 'Bank details are encrypted and only used for commission payments.'] },
    { title: 'Licenses & states', short: 'Licenses', caption: 'AHIP and territories', icon: 'diploma-verified-bold-duotone', mins: 2,
      subtitle: 'Add your AHIP certification and the states where you will sell.',
      tips: ['AHIP must be completed for the current plan year.', 'You can only sell in states where you hold an active license and appointment.'] },
    { title: 'Training', short: 'Training', caption: '4 short modules', icon: 'square-academic-cap-bold-duotone', mins: 8,
      subtitle: 'Four short modules, each with a 5-question check.',
      tips: ['Pass each module with 60% or more.', 'Your best score per module counts toward the 85% average.', 'Use keys 1-4 to answer and arrow keys to move.'] },
    { title: 'Background check', short: 'Background', caption: 'Vendor verification', icon: 'shield-user-bold-duotone', mins: 1,
      subtitle: 'Authorize the check. Our vendor emails you a secure link.',
      tips: ['You can continue while the vendor completes the check.', 'Results usually arrive in 1-3 business days.'] },
    { title: 'Review & sign', short: 'Sign', caption: 'Contract and submit', icon: 'pen-new-square-bold-duotone', mins: 2,
      subtitle: 'Check your application, sign the contract and submit.',
      tips: ['Use Edit to jump back to any step. Your answers stay saved.', 'Your typed name is a legally binding signature.'] },
    { title: 'Ready to sell', short: 'Ready', caption: 'Admin approval', icon: 'cup-star-bold-duotone', mins: 0,
      tips: ['Admin review usually takes 3-5 business days.', 'We email you as soon as a decision is made.'] }
  ];

  var NIPR = {
    name: { first: 'James', mi: 'R', last: 'Martinez' },
    license: 'FL-W123456', resident: 'Florida', loa: 'Health, Life', expires: '03/31/2028',
    states: ['FL', 'TX', 'GA'],
    address: { street: '1801 NW 9th Ave', suite: 'Suite 210', zip: '33136' }
  };
  var ZIPS = {
    '33136': ['Miami', 'FL'], '33101': ['Miami', 'FL'], '32801': ['Orlando', 'FL'], '33602': ['Tampa', 'FL'],
    '77001': ['Houston', 'TX'], '75201': ['Dallas', 'TX'], '30301': ['Atlanta', 'GA'], '10001': ['New York', 'NY'],
    '90001': ['Los Angeles', 'CA'], '85001': ['Phoenix', 'AZ'], '60601': ['Chicago', 'IL'], '27601': ['Raleigh', 'NC']
  };
  var BANKS = { '021000021': 'JPMorgan Chase Bank', '026009593': 'Bank of America', '121000248': 'Wells Fargo Bank', '111000025': 'Bank of America (TX)' };
  var STATES = [['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'], ['CA', 'California'], ['CO', 'Colorado'], ['CT', 'Connecticut'], ['DE', 'Delaware'], ['DC', 'District of Columbia'], ['FL', 'Florida'], ['GA', 'Georgia'], ['HI', 'Hawaii'], ['ID', 'Idaho'], ['IL', 'Illinois'], ['IN', 'Indiana'], ['IA', 'Iowa'], ['KS', 'Kansas'], ['KY', 'Kentucky'], ['LA', 'Louisiana'], ['ME', 'Maine'], ['MD', 'Maryland'], ['MA', 'Massachusetts'], ['MI', 'Michigan'], ['MN', 'Minnesota'], ['MS', 'Mississippi'], ['MO', 'Missouri'], ['MT', 'Montana'], ['NE', 'Nebraska'], ['NV', 'Nevada'], ['NH', 'New Hampshire'], ['NJ', 'New Jersey'], ['NM', 'New Mexico'], ['NY', 'New York'], ['NC', 'North Carolina'], ['ND', 'North Dakota'], ['OH', 'Ohio'], ['OK', 'Oklahoma'], ['OR', 'Oregon'], ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'], ['SC', 'South Carolina'], ['SD', 'South Dakota'], ['TN', 'Tennessee'], ['TX', 'Texas'], ['UT', 'Utah'], ['VT', 'Vermont'], ['VA', 'Virginia'], ['WA', 'Washington'], ['WV', 'West Virginia'], ['WI', 'Wisconsin'], ['WY', 'Wyoming']];
  var STATE_NAME = {};
  STATES.forEach(function (s) { STATE_NAME[s[0]] = s[1]; });

  var MODULES = [
    { id: 'A', kind: 'Video', title: 'C-SNP product overview', mins: 8, icon: 'videocamera-record-bold-duotone', tone: '',
      material: 'video',
      questions: [
        { q: "What is the primary target population for EnrollAxis's C-SNP plans?", opts: ['Patients with diabetes only', 'Patients with ESRD or Chronic Kidney Disease (CKD)', 'All Medicare-eligible beneficiaries over 65', 'Patients with congestive heart failure'], ans: 1 },
        { q: 'Which plan type offers supplemental benefits such as dental and vision beyond Original Medicare?', opts: ['Medicare Supplement (Medigap)', 'Part D Prescription Drug Plan', 'Medicare Advantage (Part C)', 'Medicare Savings Account (MSA)'], ans: 2 },
        { q: 'What does ESRD stand for?', opts: ['Extended Systematic Renal Disorder', 'Early Stage Renal Deficiency', 'End Stage Renal Disease', 'Emergency Surgical Renal Diagnosis'], ans: 2 },
        { q: "EnrollAxis's C-SNP plans target members with which qualifying condition?", opts: ['COPD and asthma', 'HIV/AIDS', 'Diabetes mellitus only', 'Chronic Kidney Disease (CKD) or End-Stage Renal Disease (ESRD)'], ans: 3 },
        { q: 'Which federal agency oversees and regulates Medicare Advantage plans?', opts: ['Food and Drug Administration (FDA)', 'Centers for Medicare & Medicaid Services (CMS)', 'Centers for Disease Control (CDC)', 'Office of Inspector General (OIG)'], ans: 1 }
      ] },
    { id: 'B', kind: 'Reading', title: 'Enrollment & compliance', mins: 6, icon: 'book-bookmark-bold-duotone', tone: 'is-secondary',
      material: '<p>The <strong>AEP</strong> (Annual Enrollment Period) runs <strong>Oct 15 - Dec 7</strong> each year. The <strong>ICEP</strong> (Initial Coverage Election Period) applies to newly Medicare-eligible beneficiaries.</p><p>A <strong>Scope of Appointment (SOA)</strong> must be obtained at least <strong>48 hours</strong> before any marketing appointment. CMS prohibits gifts or incentives worth more than <strong>$15</strong>.</p><p><strong>SEPs</strong> are triggered by qualifying life events, such as moving out of a plan\'s service area.</p>',
      questions: [
        { q: 'The Annual Enrollment Period (AEP) for Medicare Advantage runs from:', opts: ['January 1 - March 31', 'October 15 - December 7', 'November 1 - December 15', 'September 1 - October 31'], ans: 1 },
        { q: 'ICEP stands for:', opts: ['Interim Coverage Eligibility Period', 'Individual Coverage Enrollment Plan', 'Initial Coverage Election Period', 'Initial Carrier Election Period'], ans: 2 },
        { q: 'A Scope of Appointment (SOA) must be obtained at least how many hours before a Medicare sales appointment?', opts: ['24 hours', '36 hours', '48 hours', '72 hours'], ans: 2 },
        { q: 'Under CMS marketing guidelines, agents are PROHIBITED from:', opts: ['Providing members with plan Summary of Benefits', 'Discussing plan premium amounts', 'Offering gifts or incentives valued over $15', 'Scheduling a follow-up appointment'], ans: 2 },
        { q: 'A Special Enrollment Period (SEP) may be triggered by:', opts: ['Annual calendar date only', "A qualifying life event such as moving out of a plan's service area", "A plan's premium increase", 'Agent request to the carrier'], ans: 1 }
      ] },
    { id: 'C', kind: 'PDF', title: 'C-SNP product guide', mins: 5, icon: 'file-text-bold-duotone', tone: 'is-info',
      material: '<p>C-SNP enrollment requires <strong>Medicare Parts A &amp; B</strong> plus a qualifying chronic condition (ESRD/CKD). The <strong>PQAT</strong> assesses clinical appropriateness.</p><p>Under <strong>HIPAA</strong>, all Protected Health Information (PHI) must stay confidential and any breach must be reported promptly. The <strong>Plan Recommendation Engine</strong> matches members to the right plan based on their chronic condition profile. CKD = Chronic Kidney Disease.</p>',
      questions: [
        { q: 'To enroll in a C-SNP plan, a beneficiary must have:', opts: ['Medicare Part A only', 'Medicare Parts A and B AND the qualifying chronic condition', 'An active Medigap plan', 'Part D enrollment in effect'], ans: 1 },
        { q: 'The PQAT questionnaire is used to:', opts: ['Verify agent licensing credentials', 'Assess clinical appropriateness of the C-SNP plan for the member', "Calculate a member's estimated annual premium", 'Determine the copay structure for the plan'], ans: 1 },
        { q: 'CKD stands for:', opts: ['Comprehensive Kidney Diagnosis', 'Critical Kidney Deficiency', 'Chronic Kidney Disease', 'Cellular Kidney Disorder'], ans: 2 },
        { q: "Under HIPAA, an agent's primary obligation is to:", opts: ["Share member PHI with the member's spouse upon verbal request", 'Submit member diagnosis records to the state annually', 'Report any PHI breaches to the carrier and affected member promptly', 'Store member records on personal devices for easy access'], ans: 2 },
        { q: 'The Plan Recommendation Engine helps agents:', opts: ['File claims on behalf of enrolled members', 'Match members to the most clinically appropriate plan based on their chronic conditions', "Calculate a member's out-of-pocket maximum", "Verify the member's NPI number"], ans: 1 }
      ] },
    { id: 'D', kind: 'Quiz', title: 'Medicare fundamentals', mins: 3, icon: 'checklist-minimalistic-bold-duotone', tone: 'is-warning',
      material: '',
      questions: [
        { q: 'What does MAPD stand for?', opts: ['Medicare Advantage Prescription Drug Plan', 'Medicare Approved Provider Directory', 'Managed Advantage Plan with Disability', 'Medicare Agency Partnership Division'], ans: 0 },
        { q: 'Which enrollment period allows MA plan members to switch plans from January 1 - March 31?', opts: ['Annual Enrollment Period (AEP)', 'Initial Coverage Election Period (ICEP)', 'Open Enrollment Period (OEP)', 'Special Enrollment Period (SEP)'], ans: 2 },
        { q: "An agent's National Producer Number (NPN) is managed through:", opts: ['Centers for Medicare & Medicaid Services (CMS)', 'The state department of insurance', 'National Insurance Producer Registry (NIPR)', 'The appointing carrier'], ans: 2 },
        { q: 'Medicare Part D primarily covers:', opts: ['Inpatient hospital stays', 'Outpatient physician services', 'Prescription drug costs', 'Long-term custodial care'], ans: 2 },
        { q: 'The maximum number of certification exam attempts allowed in this onboarding is:', opts: ['2 attempts', '3 attempts', '4 attempts', 'Unlimited attempts'], ans: 2 }
      ] }
  ];
  var PASS_MODULE = 60, PASS_AVG = 85, MAX_ATTEMPTS = 4;

  /* ------------------------------------------------------------------ state */
  function freshState() {
    return {
      step: 0, visited: { 0: true }, skipped: {},
      npnStatus: '', npn: '', niprFails: 0,
      files: {}, states: [],
      bgSentAt: null, bgResentAt: null,
      exam: { best: [-1, -1, -1, -1], last: [-1, -1, -1, -1], attempts: [0, 0, 0, 0], times: [0, 0, 0, 0] },
      contractRead: false, submitted: null
    };
  }
  var S = freshState();
  var E = null; /* active exam */
  var dz = {};

  /* ------------------------------------------------------------------ helpers */
  var $ = function (id) { return document.getElementById(id); };
  var ic = function (n, c) { return window.mxIcon(n, c); };
  var esc = MX.esc;
  function val(id) { var el = $(id); return el ? String(el.value || '').trim() : ''; }
  function radio(name) { var r = document.querySelector('input[name="' + name + '"]:checked'); return r ? r.value : ''; }
  function setRadio(name, v) {
    var r = document.querySelector('input[name="' + name + '"][value="' + v + '"]');
    if (r && !r.checked) { r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); }
  }
  function setCheck(id, v) {
    var el = $(id);
    if (el && el.checked !== !!v) { el.checked = !!v; el.dispatchEvent(new Event('change', { bubbles: true })); }
  }
  function stepEl(n) { return $('obStep' + n); }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function fmtTime(ms) { var s = Math.max(1, Math.round(ms / 1000)); return s >= 60 ? Math.floor(s / 60) + 'm ' + (s % 60) + 's' : s + 's'; }
  function fmtStamp(t) { return new Date(t).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }); }
  function legalName() { return [val('piFirst'), val('piMI').replace('.', ''), val('piLast')].filter(Boolean).join(' '); }
  function normName(s) { return String(s || '').toLowerCase().replace(/[.,]/g, '').replace(/\s+/g, ' ').trim(); }
  function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }
  function cssVar(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
  function render(root) { if (window.MXIcons) MXIcons.render(root); }
  function setBusy(btn, on) { if (!btn) return; btn.classList.toggle('is-loading', on); btn.setAttribute('aria-busy', on ? 'true' : 'false'); }

  /* rule check without touching the UI */
  function quietFieldError(el) {
    if (el.disabled || el.closest('[hidden]')) return '';
    var rules = (el.getAttribute('data-rules') || '').split('|').filter(Boolean);
    for (var i = 0; i < rules.length; i++) {
      var p = rules[i].split(':');
      var m = MX.rules[p[0]] && MX.rules[p[0]](el.value || '', el, p[1]);
      if (m) return m;
    }
    return el._mxCustom ? (el._mxCustom(el.value || '', el) || '') : '';
  }

  /* ------------------------------------------------------------------ step checks */
  /* Non-field checks per step: [{ label, message, el, errId }] */
  function groupChecks(n) {
    var out = [];
    function add(label, message, el, errId) { out.push({ label: label, message: message, el: el, errId: errId }); }
    if (n === 0) {
      var npnOk = !quietFieldError($('regNPN'));
      if (npnOk && val('regNPN') && S.npnStatus !== 'found') {
        var msg = { duplicate: 'This NPN is already registered. Use a different NPN or contact support.', notfound: 'We could not find this NPN in NIPR.', error: 'NIPR did not respond. Select Try again.' }[S.npnStatus] || 'Select Look up to verify your NPN with NIPR.';
        add('NPN', msg, $('npnLookupBtn'));
      }
    }
    if (n === 2) {
      var entity = radio('taxEntity');
      if (!entity) add('Tax entity', 'Choose how you file taxes.', document.querySelector('input[name=taxEntity]'), 'taxEntityErr');
      var mode = radio('w9Mode');
      if (!mode) add('W-9 form', 'Choose to e-sign or upload your W-9.', document.querySelector('input[name=w9Mode]'), 'w9ModeErr');
      if (mode === 'esign' && !$('w9Certify').checked) add('W-9 certification', 'Confirm the W-9 certification to e-sign.', $('w9Certify'), 'w9CertErr');
      if (mode === 'upload' && !S.files.w9) add('W-9 upload', 'Upload your signed W-9 as a PDF.', $('w9File'), 'w9Err');
      var pay = radio('payMethod');
      if (!pay) add('Payment method', 'Choose direct deposit or paper check.', $('payACH'), 'payMethodErr');
      if (pay === 'check' && $('checkSameAddr').checked && !(val('piBizStreet') && val('piBizZip'))) {
        add('Check mailing address', 'Add your business address in About you, or turn this off and type an address.', $('checkSameAddr'));
      }
    }
    if (n === 3 && !S.states.length) add('Selling states', 'Add at least one state where you will sell.', $('stateSearch'), 'statesErr');
    if (n === 4 && !examPassed()) {
      var b = S.exam.best, passed = b.filter(function (x) { return x >= PASS_MODULE; }).length;
      var m = passed < 4 ? 'Pass all 4 modules (' + passed + ' of 4 done).' : 'Your average is ' + avgBest() + '%. Retake a module to reach ' + PASS_AVG + '%.';
      add('Training', m, $('moduleGrid'));
    }
    if (n === 5) {
      if (!$('bgConsent').checked) add('Authorization', 'Turn on the background check authorization.', $('bgConsent'), 'bgConsentErr');
      else if (!S.bgSentAt) add('Vendor link', 'Select "Send me the vendor link".', $('bgSendBtn'));
    }
    if (n === 6) {
      if (!S.contractRead) add('Contract', 'Scroll through the whole agreement first.', $('contractDoc'), 'contractReadErr');
      else if (!$('contractRead').checked) add('Contract', 'Check the box to agree to the contract.', $('contractRead'), 'contractReadErr');
    }
    return out;
  }

  /** Errors for a step. loud = paint them on screen. */
  function stepErrors(n, loud) {
    var root = stepEl(n);
    if (!root || n === 7) return [];
    var fields = [];
    if (loud) {
      fields = MX.validateAll(root);
    } else {
      root.querySelectorAll('[data-rules]').forEach(function (el) {
        var m = quietFieldError(el);
        if (m) fields.push({ el: el, label: MX.fieldLabel(el), message: m });
      });
    }
    var groups = groupChecks(n);
    if (loud) {
      root.querySelectorAll('.mx-group-error').forEach(function (g) { g.classList.remove('is-visible'); g.innerHTML = ''; });
      root.querySelectorAll('.mx-options.is-invalid, .mx-check-row.is-invalid').forEach(function (g) { g.classList.remove('is-invalid'); });
      groups.forEach(function (g) {
        if (g.errId) showGroupError(g.errId, g.message);
        var opts = g.el && g.el.closest && g.el.closest('.mx-options');
        if (opts) opts.classList.add('is-invalid');
        var row = g.el && g.el.closest && g.el.closest('.mx-check-row');
        if (row) row.classList.add('is-invalid');
      });
    }
    return fields.concat(groups);
  }
  function showGroupError(id, msg) {
    var g = $(id);
    if (!g) return;
    g.innerHTML = msg ? ic('danger-circle-bold') + '<span>' + esc(msg) + '</span>' : '';
    g.classList.toggle('is-visible', !!msg);
  }
  function clearGroupError(id, groupEl) {
    showGroupError(id, '');
    if (groupEl) groupEl.classList.remove('is-invalid');
  }
  function isStepComplete(n) {
    if (n === 7) return !!S.submitted;
    return stepErrors(n, false).length === 0;
  }
  function incompleteSteps() {
    var list = [];
    for (var i = 0; i <= 5; i++) if (!isStepComplete(i)) list.push(i);
    return list;
  }

  function focusTarget(el) {
    if (!el) return;
    if (el.closest && el.closest('#obStep4') && E) closeExam();
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(function () { try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); } }, 250);
  }

  function showSummary(n, errs, opts) {
    var box = stepEl(n).querySelector('.mx-error-summary');
    if (!box) return;
    if (!errs.length) { box.hidden = true; box.innerHTML = ''; return; }
    var title = (opts && opts.title) || (errs.length === 1 ? 'One thing needs your attention' : errs.length + ' things need your attention');
    box.innerHTML = ic('danger-circle-bold') + '<div class="mx-alert-body"><div class="mx-alert-title">' + esc(title) + '</div>' +
      ((opts && opts.lead) ? '<div>' + esc(opts.lead) + '</div>' : '') +
      '<ul>' + errs.map(function (e, i) { return '<li><button type="button" data-i="' + i + '">' + esc(e.label) + ': ' + esc(e.message) + '</button></li>'; }).join('') + '</ul></div>';
    box.querySelectorAll('button[data-i]').forEach(function (b) {
      b.addEventListener('click', function () {
        var e = errs[+b.getAttribute('data-i')];
        if (e.go != null) obGoTo(e.go); else focusTarget(e.el);
      });
    });
    box.hidden = false;
    if (opts && opts.live) return;
    box.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(function () { box.focus({ preventScroll: true }); }, 300);
  }
  function hideSummary(n) { var b = stepEl(n) && stepEl(n).querySelector('.mx-error-summary'); if (b) { b.hidden = true; b.innerHTML = ''; } }

  /* ------------------------------------------------------------------ chrome */
  function buildChrome() {
    for (var n = 1; n <= 6; n++) {
      var st = STEPS[n], sec = stepEl(n);
      var head = sec.querySelector('.ob-step-head');
      head.innerHTML = '<span class="mx-icon-box"><span data-icon="' + st.icon + '"></span></span>' +
        '<div class="mx-titles"><span class="mx-overline">Step ' + (n + 1) + ' of ' + TOTAL + '</span><h2 class="mx-h4" id="obT' + n + '" tabindex="-1">' + esc(st.title) + '</h2><p class="mx-body2">' + esc(st.subtitle) + '</p></div>' +
        '<span class="mx-label ob-hide-sm"><span data-icon="clock-circle-bold-duotone"></span>About ' + st.mins + ' min</span>';
      var foot = sec.querySelector('.ob-step-foot');
      var left = '<button type="button" class="mx-btn mx-btn-text mx-btn-neutral" onclick="obBack(' + n + ')"><span data-icon="arrow-left-linear"></span><span class="ob-hide-sm">Back</span></button>';
      var right;
      if (n === 6) {
        right = '<button type="button" class="mx-btn mx-btn-contained mx-btn-primary mx-btn-lg" id="submitBtn" onclick="obNext(6)"><span data-icon="plain-2-bold-duotone"></span>Submit application</button>';
      } else {
        right = '<button type="button" class="mx-btn mx-btn-soft mx-btn-neutral" onclick="skipStep(' + n + ')" title="Save what you have and come back later">Finish later</button>' +
          '<span class="ob-next-hint">Next: <strong>' + esc(STEPS[n + 1].title) + '</strong></span>' +
          '<button type="button" class="mx-btn mx-btn-contained mx-btn-primary mx-btn-lg" onclick="obNext(' + n + ')">Continue<span data-icon="arrow-right-linear"></span></button>';
      }
      foot.innerHTML = left + '<div class="ob-foot-right">' + right + '</div>';
    }
    var h0 = $('obT0'); if (h0) h0.setAttribute('tabindex', '-1');
    render(document);
  }

  function stepStatus(i) {
    if (i === 7) return S.submitted ? 'done' : 'locked';
    if (isStepComplete(i)) return 'done';
    if (S.skipped[i] || (S.visited[i] && i < S.step)) return 'attention';
    return '';
  }

  function renderNav() {
    var done = 0, statuses = [];
    for (var i = 0; i < TOTAL; i++) { statuses[i] = stepStatus(i); if (i < 7 && statuses[i] === 'done') done++; }
    document.querySelectorAll('[data-nav-group]').forEach(function (ul) {
      ul.innerHTML = ul.getAttribute('data-nav-group').split(',').map(function (s) {
        var i = +s, st = statuses[i], step = STEPS[i];
        var cls = 'mx-nav-item' + (i === S.step ? ' is-active' : '') + (st ? ' is-' + st : '');
        var cap = { done: 'Complete', attention: 'Needs attention', locked: 'Unlocks after you submit' }[st] || step.caption;
        var statusIcon = { done: 'check-circle-bold', attention: 'danger-circle-bold', locked: 'lock-keyhole-minimalistic-bold-duotone' }[st];
        return '<li><button type="button" class="' + cls + '" id="bar' + i + '" onclick="obGoTo(' + i + ')" title="' + esc(step.title + ' - ' + cap) + '"' + (i === S.step ? ' aria-current="step"' : '') + (st === 'locked' ? ' aria-disabled="true"' : '') + '>' +
          '<span class="mx-nav-icon">' + ic(step.icon) + '</span><span class="mx-nav-short" aria-hidden="true">' + esc(step.short) + '</span><span class="mx-nav-text"><span class="mx-nav-title">' + esc(step.title) + '</span><span class="mx-nav-caption">' + esc(cap) + '</span></span>' +
          (statusIcon ? '<span class="mx-nav-status">' + ic(statusIcon) + '</span>' : '') + '</button></li>';
      }).join('');
    });
    var pct = S.submitted ? 100 : Math.round(done / 7 * 100);
    $('navPct').textContent = pct + '%';
    $('navBar').style.width = pct + '%';
    $('navMeta').textContent = S.submitted ? 'Submitted for review' : done + ' of 7 steps complete';
    $('hdrBar').style.width = pct + '%';

    /* side card */
    var ring = $('sideRing');
    if (!ring.firstChild) ring.innerHTML = MX.ring(132, 12, pct, '<span class="mx-h4" id="sideRingPct">' + pct + '%</span><span class="mx-caption">complete</span>');
    else { MX.setRing(ring.querySelector('.mx-ring'), pct); $('sideRingPct').textContent = pct + '%'; }
    $('sideMeta').textContent = S.submitted ? 'Application submitted' : done + ' of 7 steps complete';
    var mins = 0, todo = [];
    for (var j = 0; j <= 6; j++) if (statuses[j] !== 'done') { mins += STEPS[j].mins; if (j !== S.step) todo.push(j); }
    $('sideEta').textContent = S.submitted ? 'Waiting for admin review' : (mins ? 'About ' + mins + ' minutes left' : 'Ready to submit');
    $('sideList').innerHTML = S.submitted ? '' : (todo.length ? todo.slice(0, 4).map(function (k) {
      var att = statuses[k] === 'attention';
      return '<li><span style="color:' + (att ? 'var(--warning-500)' : 'var(--neutral-400)') + '">' + ic(att ? 'danger-circle-bold' : STEPS[k].icon) + '</span><a href="#" data-go="' + k + '">' + esc(STEPS[k].title) + '</a>' + (att ? '<span class="mx-label mx-label-warning" style="margin-left:auto">To do</span>' : '') + '</li>';
    }).join('') : '<li><span style="color:var(--primary-500)">' + ic('check-circle-bold') + '</span>Everything else is done</li>');
    $('sideList').querySelectorAll('[data-go]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); obGoTo(+a.getAttribute('data-go')); }); });

    var lbl = $('appStatusLabel');
    lbl.className = 'mx-label ' + (S.submitted ? 'mx-label-success' : 'mx-label-warning');
    lbl.innerHTML = ic(S.submitted ? 'check-circle-bold' : 'hourglass-bold-duotone') + (S.submitted ? 'Submitted' : 'In progress');
  }

  function renderStepMeta() {
    var st = STEPS[S.step];
    $('hdrStepNum').textContent = 'Step ' + (S.step + 1) + ' of ' + TOTAL;
    $('hdrStepName').textContent = st.title;
    $('crumbStep').textContent = st.title;
    $('sideTips').innerHTML = st.tips.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('');
    document.title = st.title + ' | Agent Onboarding | EnrollAxis';
  }

  /* ------------------------------------------------------------------ navigation */
  window.obGoTo = function (n, force) {
    if (n < 0 || n >= TOTAL) return;
    if (n === 7 && !S.submitted && !force) {
      var inc = incompleteSteps();
      MX.dialog({
        tone: 'warning', icon: 'lock-keyhole-minimalistic-bold-duotone', title: 'Ready to sell unlocks after you submit',
        html: inc.length
          ? '<p style="margin:0 0 8px">Finish these steps first, then submit from Review &amp; sign:</p><ul style="margin:0;padding-left:18px">' + inc.map(function (i) { return '<li><a href="#" data-dialog-value="' + i + '">' + esc(STEPS[i].title) + '</a></li>'; }).join('') + '</ul>'
          : '<p style="margin:0">All steps are complete. Sign the contract and submit to finish.</p>',
        actions: [{ label: 'Close', variant: 'outlined', value: null }, { label: 'Go to Review & sign', variant: 'contained', value: '6' }]
      }).then(function (v) { if (v != null) obGoTo(+v); });
      return;
    }
    if (S.step === 4 && n !== 4 && E) closeExam(true);
    document.querySelectorAll('.ob-step').forEach(function (s) { s.classList.remove('is-active'); });
    stepEl(n).classList.add('is-active');
    S.step = n;
    S.visited[n] = true;
    if (n === 4) renderTraining();
    if (n === 6) { renderReview(); syncContract(); }
    if (n === 2) syncTaxText();
    renderStepMeta();
    renderNav();
    setNav(false);
    window.scrollTo({ top: 0, behavior: 'auto' });
    var h = $('obT' + n);
    if (h && document.activeElement && document.activeElement !== document.body) { try { h.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
    persist();
  };

  window.obNext = function (n) {
    if (n === 0 && S.npnStatus !== 'found' && !quietFieldError($('regNPN'))) {
      obLookupNPN().then(function (ok) { if (ok) window.obNext(0); });
      return;
    }
    if (n === 6) return submitApplication();
    var errs = stepErrors(n, true);
    if (errs.length) { showSummary(n, errs); return; }
    hideSummary(n);
    S.skipped[n] = false;
    obGoTo(n + 1);
  };
  window.obBack = function (n) { obGoTo(n - 1); };
  window.skipStep = function (n) {
    var left = stepErrors(n, false).length;
    S.skipped[n] = left > 0;
    hideSummary(n);
    if (left) MX.toast({ type: 'primary', icon: 'cloud-check-bold-duotone', title: 'Saved for later', message: STEPS[n].title + ' has ' + plural(left, 'item') + ' left. It is marked in the step list so you can come back.' });
    obGoTo(n + 1);
  };

  /* ------------------------------------------------------------------ step 0: NPN */
  var lookupSeq = 0;
  window.obLookupNPN = function (fast) {
    var el = $('regNPN');
    el._mxTouched = true;
    if (MX.validateField(el, { shake: true })) { el.focus(); return Promise.resolve(false); }
    var npn = MX.digits(el.value), seq = ++lookupSeq, btn = $('npnLookupBtn'), out = $('npnResult');
    setBusy(btn, true);
    out.innerHTML = '<div class="ob-lookup-loading"><svg viewBox="0 0 88 64" aria-hidden="true"><rect x="4" y="8" width="64" height="44" rx="8" fill="var(--primary-50)" stroke="var(--primary-200)"/><circle cx="22" cy="26" r="8" fill="var(--primary-200)"/><rect x="36" y="20" width="24" height="4" rx="2" fill="var(--primary-200)"/><rect x="36" y="29" width="18" height="4" rx="2" fill="var(--primary-100)"/><rect x="14" y="40" width="44" height="4" rx="2" fill="var(--primary-100)"/>' +
      '<g class="ob-magnify"><circle cx="46" cy="30" r="12" fill="var(--white)" fill-opacity=".5" stroke="var(--primary-500)" stroke-width="3.5"/><path d="M55 39l9 9" stroke="var(--primary-500)" stroke-width="4" stroke-linecap="round"/></g></svg>' +
      '<div style="flex:1"><p class="mx-subtitle">Searching NIPR for NPN ' + esc(npn) + '</p><p class="mx-caption">This usually takes a couple of seconds.</p><div class="mx-skel mx-mt-8" style="height:8px;width:70%"></div></div></div>';
    render(out);
    return wait(fast ? 300 : 1300).then(function () {
      if (seq !== lookupSeq) return false;
      setBusy(btn, false);
      S.npn = npn;
      if (npn === '12345678') {
        S.npnStatus = 'duplicate';
        MX.setFieldError(el, 'This NPN is already registered.');
        out.innerHTML = '<div class="mx-alert mx-alert-error"><span data-icon="danger-circle-bold"></span><div class="mx-alert-body"><div class="mx-alert-title">This NPN already has an EnrollAxis account</div>NPN ' + npn + ' is linked to an existing producer. Each NPN can be registered only once, so we have let our admin team know (reference DUP-' + npn.slice(-4) + ').' +
          '<div class="mx-alert-actions"><a class="mx-btn mx-btn-contained mx-btn-error mx-btn-sm" href="mailto:brokersupport@enrollaxis.com?subject=Duplicate%20NPN%20' + npn + '">Contact support</a><button type="button" class="mx-btn mx-btn-outlined mx-btn-error mx-btn-sm" data-act="retype">Use a different NPN</button></div></div></div>';
      } else if (/^0+$/.test(npn)) {
        S.npnStatus = 'notfound';
        MX.setFieldError(el, 'No producer found for this NPN.');
        out.innerHTML = '<div class="mx-alert mx-alert-warning"><span data-icon="sad-circle-bold-duotone"></span><div class="mx-alert-body"><div class="mx-alert-title">We could not find NPN ' + npn + '</div>Check the number on your NIPR record. If you were licensed in the last 48 hours, NIPR may not have it yet.' +
          '<div class="mx-alert-actions"><a class="mx-btn mx-btn-soft mx-btn-warning mx-btn-sm" href="https://nipr.com/help/look-up-your-npn" target="_blank" rel="noopener">Find my NPN on NIPR</a><button type="button" class="mx-btn mx-btn-text mx-btn-neutral mx-btn-sm" data-act="retype">Edit NPN</button></div></div></div>';
      } else if (npn === '99999999' && S.niprFails < 1) {
        S.niprFails++;
        S.npnStatus = 'error';
        out.innerHTML = '<div class="mx-alert mx-alert-error"><span data-icon="server-square-cloud-bold-duotone"></span><div class="mx-alert-body"><div class="mx-alert-title">NIPR is not responding right now</div>This is a problem on our side, not yours. Your progress is saved. Try again in a moment.' +
          '<div class="mx-alert-actions"><button type="button" class="mx-btn mx-btn-contained mx-btn-error mx-btn-sm" data-act="retry"><span data-icon="refresh-bold"></span>Try again</button></div></div></div>';
        MX.toast({ type: 'error', title: 'Lookup failed', message: 'NIPR timed out after 10 seconds (error 504).' });
      } else {
        S.npnStatus = 'found';
        MX.setFieldError(el, '');
        el.closest('.mx-field').classList.add('is-valid');
        renderRecord();
        var filled = applyNipr();
        MX.toast({ type: 'success', title: 'Found you, ' + NIPR.name.first, message: filled ? 'We pre-filled ' + plural(filled, 'field') + ' from your NIPR record.' : 'Your NIPR record is verified.' });
      }
      out.querySelectorAll('[data-act]').forEach(function (b) {
        b.addEventListener('click', function () {
          if (b.getAttribute('data-act') === 'retry') obLookupNPN();
          else { el.select(); el.focus(); }
        });
      });
      render(out);
      renderNav();
      persist();
      return S.npnStatus === 'found';
    });
  };

  function renderRecord() {
    var n = NIPR.name;
    $('npnResult').innerHTML = '<div class="ob-record"><div class="ob-record-head"><span class="mx-avatar">' + n.first[0] + n.last[0] + '</span><div style="flex:1;min-width:0"><p class="mx-h6">' + esc(n.first + ' ' + n.mi + ' ' + n.last) + '</p><p class="mx-caption">NPN ' + esc(S.npn) + ' &middot; Resident state ' + esc(NIPR.resident) + '</p></div>' +
      '<span class="mx-label mx-label-success"><span data-icon="verified-check-bold"></span>License active</span></div>' +
      '<div class="ob-record-grid"><div class="ob-kv"><p class="mx-caption">License number</p><p class="mx-subtitle mx-mono">' + NIPR.license + '</p></div><div class="ob-kv"><p class="mx-caption">Lines of authority</p><p class="mx-subtitle">' + NIPR.loa + '</p></div>' +
      '<div class="ob-kv"><p class="mx-caption">Licensed states</p><p class="mx-subtitle">' + NIPR.states.join(', ') + '</p></div><div class="ob-kv"><p class="mx-caption">License expires</p><p class="mx-subtitle">' + NIPR.expires + '</p></div></div>' +
      '<div style="padding:0 16px 14px" class="mx-caption">Not you? <a href="#" id="npnNotMe">Enter a different NPN</a></div></div>';
    render($('npnResult'));
    $('npnNotMe').addEventListener('click', function (e) { e.preventDefault(); resetNpn(); $('regNPN').select(); $('regNPN').focus(); });
  }
  function resetNpn() {
    lookupSeq++;
    setBusy($('npnLookupBtn'), false);
    S.npnStatus = '';
    $('npnResult').innerHTML = '';
    var f = $('regNPN').closest('.mx-field');
    f.classList.remove('is-valid');
    MX.setFieldError($('regNPN'), '');
    renderNav();
  }
  /* Fill empty fields from the NIPR record. Returns how many were filled. */
  function applyNipr() {
    var map = { piFirst: NIPR.name.first, piMI: NIPR.name.mi, piLast: NIPR.name.last, piBizStreet: NIPR.address.street, piBizSuite: NIPR.address.suite, piBizZip: NIPR.address.zip };
    var n = 0;
    Object.keys(map).forEach(function (id) { if (!val(id)) { MX.setValue(id, map[id]); n++; } });
    zipLookup();
    NIPR.states.forEach(function (c) { if (S.states.indexOf(c) === -1) { S.states.push(c); n++; } });
    renderStates();
    $('niprPrefillNote').hidden = false;
    $('niprBadgeName').hidden = false;
    $('niprBadgeAddr').hidden = false;
    return n;
  }

  /* ------------------------------------------------------------------ step 1: address */
  function zipLookup() {
    var zip = val('piBizZip'), city = $('piBizCity'), st = $('piBizState');
    var hint = $('piBizZip').closest('.mx-field').querySelector('.mx-helper-hint');
    if (!hint) {
      hint = document.createElement('p');
      hint.className = 'mx-helper mx-helper-hint';
      $('piBizZip').closest('.mx-field').appendChild(hint);
    }
    hint.innerHTML = '';
    function editable(on) {
      [city, st].forEach(function (el) {
        el.readOnly = !on;
        if (on) el.setAttribute('data-rules', 'required'); else { el.removeAttribute('data-rules'); MX.setFieldError(el, ''); }
      });
    }
    if (zip.length !== 5) {
      if (city.readOnly) { MX.setValue(city, ''); MX.setValue(st, ''); }
      return;
    }
    var hit = ZIPS[zip];
    if (hit) {
      editable(false);
      MX.setValue(city, hit[0]); MX.setValue(st, hit[1]);
      MX.setFieldError(city, ''); MX.setFieldError(st, '');
      hint.innerHTML = '<span class="ob-inline-check">' + ic('check-circle-bold') + 'Found ' + esc(hit[0] + ', ' + hit[1]) + '</span>';
    } else {
      if (city.readOnly) { editable(true); MX.setValue(city, ''); MX.setValue(st, ''); }
      city.setAttribute('data-required-msg', 'Enter your city.');
      st.setAttribute('data-required-msg', 'Enter your 2-letter state code.');
      hint.innerHTML = '<span style="color:var(--warning-800)">We could not match this ZIP. Type your city and state.</span>';
    }
  }

  /* ------------------------------------------------------------------ step 2: tax */
  function syncEntity() {
    var e = radio('taxEntity'), tin = $('taxTIN');
    $('taxIdFields').hidden = !e;
    if (!e) return;
    var ind = e === 'individual';
    var want = ind ? 'ssn' : 'ein';
    if (tin.getAttribute('data-mask') !== want) {
      tin.setAttribute('data-mask', want);
      tin.setAttribute('data-rules', 'required|' + want);
      tin.setAttribute('data-label', ind ? 'Social Security number' : 'EIN');
      tin.setAttribute('placeholder', ind ? 'XXX-XX-XXXX' : 'XX-XXXXXXX');
      $('taxTINLabel').innerHTML = (ind ? 'Social Security number' : 'Employer ID number (EIN)') + '<span class="req">*</span>';
      if (tin.value) MX.setValue(tin, '');
      MX.setFieldError(tin, '');
    }
    $('taxSameNameRow').hidden = !ind;
    $('taxNameLabel').innerHTML = (ind ? 'Name on tax return' : 'Business name (as on tax return)') + '<span class="req">*</span>';
    $('taxNameField').hidden = ind && $('taxSameName').checked;
    clearGroupError('taxEntityErr', $('taxEntityGroup'));
    syncTaxText();
  }
  function syncTaxText() {
    var name = legalName() || 'Add your name in About you';
    $('taxSameNameText').textContent = name;
    var addr = val('piBizStreet') ? val('piBizStreet') + (val('piBizSuite') ? ', ' + val('piBizSuite') : '') + ', ' + val('piBizCity') + ', ' + val('piBizState') + ' ' + val('piBizZip') : '';
    $('checkSameAddrText').textContent = addr || 'Add your business address in About you first';
    var entityTxt = { individual: 'Individual', llc: 'Single-member LLC', corp: 'Corporation', partnership: 'Partnership' }[radio('taxEntity')] || 'Entity type not chosen';
    var tinD = MX.digits(val('taxTIN'));
    var w9Name = (radio('taxEntity') === 'individual' && $('taxSameName').checked) ? legalName() : val('taxName');
    $('w9Summary').textContent = [w9Name || 'Name missing', entityTxt, tinD.length === 9 ? 'TIN ending ' + tinD.slice(-4) : 'TIN missing', addr ? val('piBizCity') + ', ' + val('piBizState') : 'Address missing'].join(' · ');
  }
  function syncW9Mode() {
    var m = radio('w9Mode');
    $('w9EsignPanel').hidden = m !== 'esign';
    $('w9UploadPanel').hidden = m !== 'upload';
    clearGroupError('w9ModeErr', $('w9ModeGroup'));
    syncTaxText();
  }
  function syncPay() {
    var p = radio('payMethod');
    $('achFields').hidden = p !== 'ach';
    $('checkFields').hidden = p !== 'check';
    $('checkAddrField').hidden = $('checkSameAddr').checked;
    clearGroupError('payMethodErr', $('payMethodGroup'));
  }
  function syncRouting() {
    var r = MX.digits(val('bankRouting')), box = $('bankDetected');
    if (r.length === 9) {
      $('bankRouting')._mxTouched = true;
      var bad = MX.validateField($('bankRouting'));
      box.hidden = !!bad;
      if (!bad) {
        box.innerHTML = '<span class="mx-label mx-label-success">' + ic('verified-check-bold') + esc(BANKS[r] || 'Routing number verified') + '</span>';
      }
    } else box.hidden = true;
  }

  /* ------------------------------------------------------------------ step 3: AHIP + states */
  function syncAhip() {
    var d = MX.parseUSDate(val('ahipDate')), exp = $('ahipExpiry'), hint = $('ahipExpiryHint');
    if (!d) { MX.setValue(exp, ''); hint.textContent = 'Worked out from your completion date'; hint.style.color = ''; return; }
    var x = new Date(d.getFullYear() + 1, d.getMonth(), d.getDate());
    MX.setValue(exp, MX.formatUSDate(x));
    var days = Math.round((x - new Date()) / 864e5);
    if (days < 0) { hint.textContent = 'Expired'; hint.style.color = 'var(--danger-600)'; }
    else if (days < 60) { hint.textContent = 'Expires in ' + days + ' days. Renew soon.'; hint.style.color = 'var(--warning-800)'; }
    else { hint.innerHTML = '<span class="ob-inline-check">' + ic('check-circle-bold') + 'Valid for ' + days + ' more days</span>'; hint.style.color = ''; }
  }
  function renderStates() {
    var wrap = $('stateChips'), pending = [];
    wrap.innerHTML = S.states.map(function (c) {
      var lic = NIPR.states.indexOf(c) !== -1 && S.npnStatus === 'found';
      if (!lic) pending.push(STATE_NAME[c]);
      return '<span class="mx-chip ' + (lic ? 'is-primary' : 'is-warning') + '" title="' + (lic ? 'Active license on NIPR' : 'No active license yet') + '">' + ic(lic ? 'verified-check-bold' : 'danger-triangle-bold', 'mx-ic-16') + esc(STATE_NAME[c]) +
        '<button type="button" class="mx-chip-x" data-x="' + c + '" aria-label="Remove ' + esc(STATE_NAME[c]) + '">' + ic('close-circle-bold') + '</button></span>';
    }).join('') || '<span class="mx-caption">No states added yet.</span>';
    wrap.querySelectorAll('[data-x]').forEach(function (b) {
      b.addEventListener('click', function () {
        var c = b.getAttribute('data-x');
        S.states = S.states.filter(function (x) { return x !== c; });
        renderStates();
        MX.toast({ type: 'info', title: STATE_NAME[c] + ' removed', action: { label: 'Undo', onClick: function () { S.states.push(c); renderStates(); persist(); } } });
        persist();
      });
    });
    $('statesCount').textContent = plural(S.states.length, 'state');
    $('statePendingNote').hidden = !pending.length;
    $('statePendingList').textContent = pending.join(', ');
    $('contractStates').textContent = S.states.length ? S.states.join(', ') : 'No selling states yet';
    if (S.states.length) clearGroupError('statesErr');
  }
  function setupStateCombo() {
    var input = $('stateSearch'), list = $('stateList'), hl = 0, items = [];
    function open() {
      var q = input.value.trim().toLowerCase();
      items = STATES.filter(function (s) { return !q || s[1].toLowerCase().indexOf(q) !== -1 || s[0].toLowerCase() === q; });
      hl = Math.min(hl, Math.max(0, items.length - 1));
      list.innerHTML = items.length ? items.map(function (s, i) {
        var sel = S.states.indexOf(s[0]) !== -1;
        return '<div class="mx-combo-opt' + (sel ? ' is-selected' : '') + (i === hl ? ' is-hl' : '') + '" role="option" aria-selected="' + sel + '" data-code="' + s[0] + '" id="stOpt' + i + '"><span class="mx-combo-code">' + s[0] + '</span><span style="flex:1">' + esc(s[1]) + '</span>' +
          (NIPR.states.indexOf(s[0]) !== -1 && S.npnStatus === 'found' ? '<span class="mx-label mx-label-primary">Licensed</span>' : '') + (sel ? ic('check-circle-bold', 'mx-ic-18') : '') + '</div>';
      }).join('') : '<div class="mx-combo-empty">No state matches "' + esc(input.value) + '"</div>';
      list.hidden = false;
      input.setAttribute('aria-expanded', 'true');
      if (items.length) input.setAttribute('aria-activedescendant', 'stOpt' + hl);
      var h = list.querySelector('.is-hl'); if (h) h.scrollIntoView({ block: 'nearest' });
    }
    function close() { list.hidden = true; input.setAttribute('aria-expanded', 'false'); }
    function toggle(code) {
      var i = S.states.indexOf(code);
      if (i === -1) S.states.push(code); else S.states.splice(i, 1);
      renderStates(); persist(); renderNav();
      input.value = '';
      open();
    }
    input.addEventListener('focus', open);
    input.addEventListener('input', function () { hl = 0; open(); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); hl = Math.min(items.length - 1, hl + 1); open(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); hl = Math.max(0, hl - 1); open(); }
      else if (e.key === 'Enter') { e.preventDefault(); if (items[hl]) toggle(items[hl][0]); }
      else if (e.key === 'Escape') close();
    });
    list.addEventListener('mousedown', function (e) {
      var o = e.target.closest('[data-code]');
      if (o) { e.preventDefault(); toggle(o.getAttribute('data-code')); }
    });
    input.addEventListener('blur', function () { setTimeout(close, 120); });
  }

  /* ------------------------------------------------------------------ step 4: training */
  function avgBest() {
    var b = S.exam.best;
    return Math.round(b.reduce(function (a, x) { return a + Math.max(0, x); }, 0) / 4);
  }
  function examPassed() {
    return S.exam.best.every(function (x) { return x >= PASS_MODULE; }) && avgBest() >= PASS_AVG;
  }
  window.examPassed = examPassed;
  function moduleState(i) {
    var best = S.exam.best[i], att = S.exam.attempts[i];
    if (best >= PASS_MODULE) return 'pass';
    if (att >= MAX_ATTEMPTS) return 'locked';
    if (att > 0) return 'retry';
    return 'new';
  }
  function renderTraining() {
    if (E) return;
    var passed = S.exam.best.filter(function (x) { return x >= PASS_MODULE; }).length;
    var avg = avgBest(), anyLocked = [0, 1, 2, 3].some(function (i) { return moduleState(i) === 'locked'; });
    var tone = examPassed() ? '' : (anyLocked ? 'is-error' : (passed === 4 ? 'is-warning' : ''));
    var title, text, label;
    if (examPassed()) { title = 'Certification passed'; text = 'Average ' + avg + '% across all four modules. Nice work.'; label = '<span class="mx-label mx-label-success">' + ic('medal-ribbons-star-bold-duotone') + 'Passed</span>'; }
    else if (anyLocked) { title = 'A module is out of attempts'; text = 'Contact broker support to reset your attempts. Your other scores are kept.'; label = '<span class="mx-label mx-label-error">Action needed</span>'; }
    else if (passed === 4) { title = 'Almost there'; text = 'Your average is ' + avg + '%. Retake any module to reach ' + PASS_AVG + '%. Only your best score counts.'; label = '<span class="mx-label mx-label-warning">Below ' + PASS_AVG + '%</span>'; }
    else if (S.exam.attempts.some(function (a) { return a > 0; })) { title = passed + ' of 4 modules passed'; text = 'Keep going. You need ' + PASS_MODULE + '% in each module and an ' + PASS_AVG + '% average.'; label = ''; }
    else { title = 'Start with Module A'; text = 'Each module is short: study the material, then answer 5 questions.'; label = ''; }
    $('trainingOverall').innerHTML = MX.ring(72, 7, avg, '<span class="mx-subtitle">' + avg + '%</span>', tone) +
      '<div class="mx-titles"><p class="mx-h6">' + esc(title) + '</p><p class="mx-caption">' + esc(text) + '</p></div>' + label;

    $('moduleGrid').innerHTML = MODULES.map(function (m, i) {
      var st = moduleState(i), best = S.exam.best[i], att = S.exam.attempts[i];
      var status = { pass: '<span class="mx-label mx-label-success">' + ic('check-circle-bold') + 'Passed</span>', retry: '<span class="mx-label mx-label-error">Retake needed</span>', locked: '<span class="mx-label mx-label-error">' + ic('lock-keyhole-minimalistic-bold-duotone') + 'Locked</span>', 'new': '<span class="mx-label">Not started</span>' }[st];
      var btn = { pass: 'Retake', retry: 'Try again', locked: 'Get help', 'new': 'Start' }[st];
      var meta = att ? 'Best ' + best + '% &middot; ' + plural(att, 'attempt') + ' of ' + MAX_ATTEMPTS + (S.exam.times[i] ? ' &middot; ' + fmtTime(S.exam.times[i]) : '') : m.questions.length + ' questions &middot; about ' + m.mins + ' min';
      return '<button type="button" class="ob-module' + (st === 'pass' ? ' is-pass' : '') + (st === 'locked' ? ' is-locked' : '') + '" data-mod="' + i + '">' +
        '<div class="ob-module-top"><span class="mx-icon-box ' + m.tone + '"><span data-icon="' + m.icon + '"></span></span><div class="mx-titles"><span class="mx-overline">Module ' + m.id + ' &middot; ' + m.kind + '</span><p class="mx-subtitle" style="margin-top:2px">' + esc(m.title) + '</p></div>' + status + '</div>' +
        '<div class="ob-module-bottom">' + MX.ring(44, 4, Math.max(0, best), '<span style="font-size:.6875rem;font-weight:700">' + (best >= 0 ? best : '-') + '</span>', st === 'retry' || st === 'locked' ? 'is-error' : '') +
        '<div class="mx-meta"><p class="mx-caption">' + meta + '</p></div><span class="mx-btn mx-btn-sm ' + (st === 'new' ? 'mx-btn-contained mx-btn-primary' : 'mx-btn-soft mx-btn-neutral') + '">' + btn + '</span></div></button>';
    }).join('');
    render($('moduleGrid'));
    render($('trainingOverall'));
    $('moduleGrid').querySelectorAll('[data-mod]').forEach(function (b) { b.addEventListener('click', function () { openModule(+b.getAttribute('data-mod')); }); });
  }

  function openModule(i) {
    var st = moduleState(i);
    if (st === 'locked') {
      MX.dialog({ tone: 'error', icon: 'lock-keyhole-minimalistic-bold-duotone', title: 'Module ' + MODULES[i].id + ' is out of attempts',
        message: 'You have used all ' + MAX_ATTEMPTS + ' attempts. Broker support can reset this module for you, usually within one business day.',
        actions: [{ label: 'Close', variant: 'outlined', value: null }, { label: 'Email support', variant: 'contained', value: 'mail' }]
      }).then(function (v) { if (v) location.href = 'mailto:brokersupport@enrollaxis.com?subject=Reset%20training%20Module%20' + MODULES[i].id; });
      return;
    }
    if (st === 'pass') {
      MX.dialog({ tone: 'primary', icon: 'restart-bold', title: 'Retake Module ' + MODULES[i].id + '?',
        message: 'Your best score (' + S.exam.best[i] + '%) is kept even if you score lower. This uses attempt ' + (S.exam.attempts[i] + 1) + ' of ' + MAX_ATTEMPTS + '.',
        actions: [{ label: 'Cancel', variant: 'outlined', value: null }, { label: 'Retake', variant: 'contained', value: true }]
      }).then(function (v) { if (v) startExam(i); });
      return;
    }
    startExam(i);
  }
  function startExam(i) {
    E = { mod: i, q: 0, answers: [null, null, null, null, null], started: Date.now(), materialOpen: true, missing: [], watched: false };
    $('trainingHome').hidden = true;
    $('trainingFoot').hidden = true;
    $('examView').hidden = false;
    hideSummary(4);
    renderExam();
    E.timer = setInterval(function () { var t = $('examTimer'); if (t && E) t.lastChild.textContent = fmtTime(Date.now() - E.started); }, 1000);
    $('obStep4').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function closeExam(silent) {
    if (E && E.timer) clearInterval(E.timer);
    E = null;
    $('examView').hidden = true;
    $('examView').innerHTML = '';
    $('trainingHome').hidden = false;
    $('trainingFoot').hidden = false;
    if (!silent) { renderTraining(); renderNav(); }
  }
  window.closeSegmentScreen = function () { closeExam(); };

  function materialHtml(m) {
    if (m.material === 'video') {
      return '<div class="ob-video" id="obVideo"><button type="button" aria-label="Play video" id="obPlay">' + ic('play-circle-bold-duotone') + '</button><span class="mx-subtitle">EnrollAxis 2026 - C-SNP product overview</span><span class="mx-caption" style="color:inherit;opacity:.8">About 8 min</span><div class="ob-video-bar"><span id="obVideoBar"></span></div></div>';
    }
    if (!m.material) return '<p style="margin:0">No study material for this module. These are general Medicare questions.</p>';
    return m.material + (m.kind === 'PDF' ? '<p style="margin:0"><span class="mx-label mx-label-info">' + ic('file-text-bold-duotone') + 'Extract from C-SNP Product Guide (PDF, 24 pages)</span></p>' : '');
  }
  function renderExam() {
    var m = MODULES[E.mod], q = m.questions[E.q], answered = E.answers.filter(function (a) { return a !== null; }).length, last = E.q === m.questions.length - 1;
    var letters = ['A', 'B', 'C', 'D'];
    var html = '<div class="ob-exam-head"><button type="button" class="mx-btn mx-btn-text mx-btn-neutral mx-btn-sm" data-ex="back">' + ic('arrow-left-linear') + 'All modules</button>' +
      '<div class="mx-titles"><span class="mx-overline">Module ' + m.id + ' &middot; Attempt ' + (S.exam.attempts[E.mod] + 1) + ' of ' + MAX_ATTEMPTS + '</span><p class="mx-h5">' + esc(m.title) + '</p></div>' +
      '<span class="ob-exam-timer" id="examTimer">' + ic('clock-circle-bold-duotone') + '<span>' + fmtTime(Date.now() - E.started) + '</span></span></div>' +
      '<div class="mx-linear mx-mb-24" aria-hidden="true"><span style="width:' + (answered / 5 * 100) + '%"></span></div>' +
      '<details class="ob-material"' + (E.materialOpen ? ' open' : '') + ' id="obMaterial"><summary>' + ic(m.icon, 'mx-ic-20') + 'Study material' + ic('alt-arrow-down-linear', 'chev') + '</summary><div class="ob-material-body">' + materialHtml(m) + '</div></details>' +
      '<div class="ob-q" role="group" aria-labelledby="obQText"><span class="mx-overline">Question ' + (E.q + 1) + ' of ' + m.questions.length + '</span><p class="ob-q-text" id="obQText">' + esc(q.q) + '</p><div class="ob-q-opts" role="radiogroup" aria-labelledby="obQText">' +
      q.opts.map(function (o, oi) {
        return '<label class="mx-option"><input type="radio" name="exq" value="' + oi + '"' + (E.answers[E.q] === oi ? ' checked' : '') + '><span class="ob-q-letter">' + letters[oi] + '</span><span class="mx-option-body"><span class="mx-option-title" style="font-weight:500">' + esc(o) + '</span></span></label>';
      }).join('') + '</div></div>' +
      '<div class="ob-q-nav"><button type="button" class="mx-btn mx-btn-outlined mx-btn-neutral" data-ex="prev"' + (E.q === 0 ? ' disabled' : '') + '>' + ic('alt-arrow-left-linear') + 'Previous</button>' +
      '<div class="ob-q-dots">' + E.answers.map(function (a, i) {
        return '<button type="button" class="ob-q-dot' + (a !== null ? ' is-answered' : '') + (i === E.q ? ' is-current' : '') + (E.missing.indexOf(i) !== -1 && a === null ? ' is-missing' : '') + '" data-q="' + i + '" aria-label="Question ' + (i + 1) + (a !== null ? ', answered' : ', not answered') + '">' + (i + 1) + '</button>';
      }).join('') + '</div>' +
      (last ? '<button type="button" class="mx-btn mx-btn-contained mx-btn-primary" data-ex="submit">' + ic('check-circle-bold') + 'Submit answers</button>'
        : '<button type="button" class="mx-btn mx-btn-contained mx-btn-neutral" data-ex="next">Next' + ic('alt-arrow-right-linear') + '</button>') + '</div>' +
      '<p class="mx-caption ob-kbd ob-hide-sm mx-mt-16">' + ic('keyboard-bold-duotone', 'mx-ic-16') + 'Press <kbd>1</kbd>-<kbd>4</kbd> to answer and <kbd>&larr;</kbd> <kbd>&rarr;</kbd> to move</p>';
    var v = $('examView');
    v.innerHTML = html;
    v.querySelector('#obMaterial').addEventListener('toggle', function (e) { if (E) E.materialOpen = e.target.open; });
    v.querySelectorAll('input[name=exq]').forEach(function (r) {
      r.addEventListener('change', function () {
        var first = E.answers[E.q] === null;
        E.answers[E.q] = +r.value;
        var cur = E.q;
        renderExam();
        if (first && cur < 4) setTimeout(function () { if (E && E.q === cur) { E.q++; renderExam(); } }, 380);
      });
    });
    v.querySelectorAll('[data-q]').forEach(function (b) { b.addEventListener('click', function () { E.q = +b.getAttribute('data-q'); renderExam(); }); });
    v.querySelectorAll('[data-ex]').forEach(function (b) {
      b.addEventListener('click', function () {
        var a = b.getAttribute('data-ex');
        if (a === 'back') leaveExam();
        if (a === 'prev') { E.q--; renderExam(); }
        if (a === 'next') { E.q++; renderExam(); }
        if (a === 'submit') submitExam();
      });
    });
    var play = $('obPlay');
    if (play) {
      if (E.watched) { $('obVideoBar').style.width = '100%'; play.innerHTML = ic('check-circle-bold'); }
      play.addEventListener('click', function () {
        if (E.watched) return;
        play.disabled = true;
        var p = 0, bar = $('obVideoBar'), t = setInterval(function () {
          p += 4;
          if (bar) bar.style.width = p + '%';
          if (p >= 100 || !E) { clearInterval(t); if (E) { E.watched = true; if (play) play.innerHTML = ic('check-circle-bold'); } }
        }, 120);
      });
    }
  }
  function leaveExam() {
    var answered = E.answers.filter(function (a) { return a !== null; }).length;
    if (!answered) return closeExam();
    MX.dialog({ tone: 'warning', icon: 'danger-triangle-bold', title: 'Leave this module?',
      message: 'Your ' + plural(answered, 'answer') + ' will not be saved and this attempt will not count.',
      actions: [{ label: 'Keep going', variant: 'outlined', value: null }, { label: 'Leave module', variant: 'contained', color: 'warning', value: true }]
    }).then(function (v) { if (v) closeExam(); });
  }
  function submitExam() {
    var missing = [];
    E.answers.forEach(function (a, i) { if (a === null) missing.push(i); });
    if (missing.length) {
      E.missing = missing;
      renderExam();
      MX.dialog({ tone: 'warning', icon: 'danger-triangle-bold', title: plural(missing.length, 'question') + ' not answered',
        html: '<p style="margin:0">Question' + (missing.length > 1 ? 's ' : ' ') + missing.map(function (i) { return i + 1; }).join(', ') + (missing.length > 1 ? ' have' : ' has') + ' no answer. Unanswered questions count as wrong.</p>',
        actions: [{ label: 'Submit anyway', variant: 'outlined', value: 'submit' }, { label: 'Review answers', variant: 'contained', value: 'review' }]
      }).then(function (v) {
        if (v === 'submit') gradeExam();
        else if (v === 'review' && E) { E.q = missing[0]; renderExam(); }
      });
      return;
    }
    gradeExam();
  }
  function gradeExam() {
    var i = E.mod, m = MODULES[i], correct = 0;
    m.questions.forEach(function (q, qi) { if (E.answers[qi] === q.ans) correct++; });
    var pct = Math.round(correct / m.questions.length * 100), took = Date.now() - E.started;
    var wasPassed = examPassed();
    S.exam.attempts[i]++;
    S.exam.last[i] = pct;
    S.exam.best[i] = Math.max(S.exam.best[i], pct);
    S.exam.times[i] = took;
    clearInterval(E.timer);
    var pass = pct >= PASS_MODULE, left = MAX_ATTEMPTS - S.exam.attempts[i];
    var nextMod = -1;
    for (var k = 1; k <= 4; k++) { var c = (i + k) % 4; if (S.exam.best[c] < PASS_MODULE && moduleState(c) !== 'locked') { nextMod = c; break; } }
    var actions = '<button type="button" class="mx-btn mx-btn-outlined mx-btn-neutral" data-r="home">All modules</button>';
    if (!pass && left > 0) actions += '<button type="button" class="mx-btn mx-btn-contained mx-btn-primary" data-r="retry">' + ic('restart-bold') + 'Try again (' + left + ' left)</button>';
    else if (nextMod >= 0) actions += '<button type="button" class="mx-btn mx-btn-contained mx-btn-primary" data-r="next">Module ' + MODULES[nextMod].id + ic('arrow-right-linear') + '</button>';
    var body = pass
      ? 'You passed Module ' + m.id + '. ' + (nextMod >= 0 ? 'On to the next one.' : (examPassed() ? 'That completes your training.' : 'Retake a module to raise your average to ' + PASS_AVG + '%.'))
      : (left > 0 ? 'You need ' + PASS_MODULE + '% to pass. Review the study material and try again. Your best score is kept.' : 'You have used all ' + MAX_ATTEMPTS + ' attempts for this module. Contact broker support to reset it.');
    $('examView').innerHTML = '<div class="ob-result" role="status">' + MX.ring(132, 12, 0, '<span class="mx-h3">' + pct + '%</span><span class="mx-caption">score</span>', pass ? '' : 'is-error') +
      '<span class="mx-label ' + (pass ? 'mx-label-success' : 'mx-label-error') + '">' + (pass ? 'Passed' : 'Not passed') + '</span>' +
      '<p class="mx-h4 mx-mt-8">' + (pass ? (pct === 100 ? 'Perfect score' : 'Well done') : 'Not quite there') + '</p>' +
      '<p class="mx-body2 mx-mt-8">' + correct + ' of ' + m.questions.length + ' correct &middot; ' + fmtTime(took) + ' &middot; attempt ' + S.exam.attempts[i] + ' of ' + MAX_ATTEMPTS + '</p>' +
      '<p class="mx-body2 mx-mt-8" style="max-width:440px;margin-left:auto;margin-right:auto">' + esc(body) + '</p>' +
      '<div class="mx-row">' + actions + '</div></div>';
    render($('examView'));
    requestAnimationFrame(function () { setTimeout(function () { MX.setRing($('examView').querySelector('.mx-ring'), pct); }, 60); });
    $('examView').querySelectorAll('[data-r]').forEach(function (b) {
      b.addEventListener('click', function () {
        var r = b.getAttribute('data-r');
        if (r === 'home') closeExam();
        if (r === 'retry') { E = null; startExam(i); }
        if (r === 'next') { E = null; startExam(nextMod); }
      });
    });
    E.done = true;
    if (!wasPassed && examPassed()) {
      celebrate(0.5);
      MX.toast({ type: 'success', icon: 'medal-ribbons-star-bold-duotone', title: 'Training complete', message: 'Average ' + avgBest() + '%. You can move on to the background check.' });
    }
    renderNav();
    persist();
  }
  document.addEventListener('keydown', function (e) {
    if (!E || E.done || S.step !== 4 || document.querySelector('.mx-dialog-root')) return;
    var t = e.target;
    if (t && (t.tagName === 'INPUT' && t.type !== 'radio' || t.tagName === 'TEXTAREA')) return;
    var map = { '1': 0, '2': 1, '3': 2, '4': 3, a: 0, b: 1, c: 2, d: 3 };
    var k = e.key.toLowerCase();
    if (k in map) {
      var r = document.querySelectorAll('#examView input[name=exq]')[map[k]];
      if (r) { r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); }
    } else if (e.key === 'ArrowRight' && E.q < 4) { E.q++; renderExam(); }
    else if (e.key === 'ArrowLeft' && E.q > 0) { E.q--; renderExam(); }
  });

  /* ------------------------------------------------------------------ step 5: background */
  function renderBgTimeline() {
    if (!S.bgSentAt) { $('bgStatusPanel').hidden = true; return; }
    $('bgStatusPanel').hidden = false;
    var sent = S.bgResentAt || S.bgSentAt;
    $('bgTimeline').innerHTML =
      '<li class="is-done"><span class="mx-tl-dot">' + ic('check-read-linear') + '</span><div><p class="mx-tl-title">Authorization given</p><p class="mx-caption">' + fmtStamp(S.bgSentAt) + '</p></div></li>' +
      '<li class="is-done"><span class="mx-tl-dot">' + ic('check-read-linear') + '</span><div><p class="mx-tl-title">Vendor link sent' + (S.bgResentAt ? ' again' : '') + '</p><p class="mx-caption">' + fmtStamp(sent) + ' to ' + esc(val('piEmail')) + '</p></div></li>' +
      '<li class="is-active"><span class="mx-tl-dot">' + ic('hourglass-bold-duotone') + '</span><div><p class="mx-tl-title">Identity verification</p><p class="mx-caption">Waiting for you to finish on the Sterling portal.</p></div></li>' +
      '<li><span class="mx-tl-dot">' + ic('shield-check-bold-duotone') + '</span><div><p class="mx-tl-title">Results</p><p class="mx-caption">Usually 1-3 business days. You do not need to wait here.</p></div></li>';
    var btn = $('bgSendBtn');
    btn.className = 'mx-btn mx-btn-soft mx-btn-primary';
    btn.innerHTML = ic('check-circle-bold') + 'Link sent';
    btn.disabled = true;
  }
  window.sendBgInvitation = function (fast) {
    if (!$('bgConsent').checked) {
      showGroupError('bgConsentErr', 'Turn on the authorization first. We cannot contact the vendor without it.');
      var row = $('bgConsentRow');
      row.classList.remove('is-shake'); void row.offsetWidth;
      row.animate && row.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }], { duration: 320 });
      $('bgConsent').focus();
      return Promise.resolve(false);
    }
    var btn = $('bgSendBtn');
    setBusy(btn, true);
    return wait(fast ? 100 : 1100).then(function () {
      setBusy(btn, false);
      S.bgSentAt = Date.now();
      renderBgTimeline();
      hideSummary(5);
      if (!fast) MX.toast({ type: 'success', icon: 'letter-opened-bold-duotone', title: 'Vendor link sent', message: 'Check ' + val('piEmail') + ' for an email from Sterling Talent Solutions.' });
      renderNav();
      persist();
      return true;
    });
  };
  window.resendBgInvitation = function () {
    var since = Date.now() - (S.bgResentAt || S.bgSentAt);
    if (since < 30000) {
      MX.toast({ type: 'warning', title: 'Please wait a moment', message: 'You can resend the link in ' + Math.ceil((30000 - since) / 1000) + ' seconds. Emails can take a minute to arrive.' });
      return;
    }
    S.bgResentAt = Date.now();
    renderBgTimeline();
    MX.toast({ type: 'success', title: 'Link sent again', message: 'Also check your spam or promotions folder.' });
    persist();
  };

  /* ------------------------------------------------------------------ step 6: review + sign */
  function stepSummary(i) {
    switch (i) {
      case 0: return S.npnStatus === 'found' ? 'NPN ' + S.npn + ' · verified with NIPR' : 'NPN not verified';
      case 1: return [legalName(), val('piPhone'), val('piBizCity') && val('piBizCity') + ', ' + val('piBizState')].filter(Boolean).join(' · ') || 'Not started';
      case 2:
        var e = { individual: 'Individual', llc: 'LLC', corp: 'Corporation', partnership: 'Partnership' }[radio('taxEntity')];
        var p = radio('payMethod') === 'ach' ? 'Direct deposit' + (val('bankAcct') ? ' ending ' + MX.digits(val('bankAcct')).slice(-4) : '') : (radio('payMethod') === 'check' ? 'Paper check' : '');
        var w = { esign: 'W-9 e-signed', upload: 'W-9 uploaded' }[radio('w9Mode')];
        return [e, w, p].filter(Boolean).join(' · ') || 'Not started';
      case 3: return [val('ahipCert') && 'AHIP ' + val('ahipCert'), S.states.length && S.states.join(', ')].filter(Boolean).join(' · ') || 'Not started';
      case 4: return S.exam.attempts.some(Boolean) ? 'Average ' + avgBest() + '% · ' + S.exam.best.filter(function (x) { return x >= PASS_MODULE; }).length + ' of 4 modules passed' : 'Not started';
      case 5: return S.bgSentAt ? 'Vendor link sent ' + fmtStamp(S.bgSentAt) : 'Not started';
    }
    return '';
  }
  function renderReview() {
    $('reviewList').innerHTML = [0, 1, 2, 3, 4, 5].map(function (i) {
      var done = isStepComplete(i), left = done ? 0 : stepErrors(i, false).length;
      return '<div class="ob-review-row"><span class="mx-icon-box mx-icon-box-sm ' + (done ? '' : 'is-warning') + '"><span data-icon="' + STEPS[i].icon + '"></span></span>' +
        '<div class="mx-titles"><p class="mx-subtitle">' + esc(STEPS[i].title) + '</p><p class="mx-caption">' + esc(stepSummary(i)) + '</p></div>' +
        (done ? '<span class="mx-label mx-label-success ob-hide-sm">' + ic('check-circle-bold') + 'Complete</span>' : '<span class="mx-label mx-label-warning ob-hide-sm">' + plural(left, 'item') + ' left</span>') +
        '<button type="button" class="mx-btn mx-btn-text mx-btn-primary mx-btn-sm" data-edit="' + i + '">' + (done ? 'Edit' : 'Finish') + '</button></div>';
    }).join('');
    render($('reviewList'));
    $('reviewList').querySelectorAll('[data-edit]').forEach(function (b) { b.addEventListener('click', function () { obGoTo(+b.getAttribute('data-edit')); }); });
  }
  function syncContract() {
    var doc = $('contractDoc');
    if (!S.contractRead && doc.scrollHeight - doc.clientHeight < 8 && doc.offsetParent) markContractRead();
    $('eSigDate').value = MX.formatUSDate(new Date());
    $('eSigDate').closest('.mx-field').classList.add('is-filled');
    var ln = legalName();
    $('eSigHint').textContent = ln ? 'Must match your legal name: ' + ln : 'Must match your legal name';
    syncSig();
  }
  function markContractRead() {
    S.contractRead = true;
    $('contractRead').disabled = false;
    $('contractReadBar').style.width = '100%';
    var h = $('contractHint');
    h.classList.add('is-done');
    h.innerHTML = ic('check-circle-bold') + '<span>You have read the whole agreement</span>';
    clearGroupError('contractReadErr', $('contractReadRow'));
  }
  function syncSig() {
    var v = val('eSigName'), p = $('sigPreview');
    p.textContent = v || 'Your signature';
    p.classList.toggle('is-empty', !v);
    $('sigMeta').textContent = v ? 'Signed ' + new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
  }
  function submitApplication() {
    var inc = incompleteSteps();
    var own = stepErrors(6, true);
    var all = inc.map(function (i) { return { label: STEPS[i].title, message: plural(stepErrors(i, false).length, 'item') + ' left to finish', go: i }; }).concat(own);
    if (all.length) {
      showSummary(6, all, {
        title: inc.length ? 'You can submit once everything is complete' : (own.length === 1 ? 'One thing needs your attention' : own.length + ' things need your attention'),
        lead: inc.length ? 'Select an item to jump straight to it.' : ''
      });
      renderReview();
      return;
    }
    hideSummary(6);
    MX.dialog({ tone: 'primary', icon: 'plain-2-bold-duotone', title: 'Submit your application?',
      message: 'The admin team will review your licensing, training and background check. You cannot edit your application while it is under review.',
      actions: [{ label: 'Keep reviewing', variant: 'outlined', value: null }, { label: 'Submit application', variant: 'contained', value: true }]
    }).then(function (ok) {
      if (!ok) return;
      var btn = $('submitBtn');
      setBusy(btn, true);
      wait(1400).then(function () {
        setBusy(btn, false);
        var now = Date.now();
        S.submitted = { at: now, caseId: 'OB-2026-' + String(Math.floor(1000 + Math.random() * 9000)) };
        renderSubmitted();
        obGoTo(7);
        celebrate(1);
        MX.toast({ type: 'success', title: 'Application submitted', message: 'Case ' + S.submitted.caseId + '. We emailed you a copy.' });
      });
    });
  }
  function renderSubmitted() {
    if (!S.submitted) return;
    $('caseID').textContent = S.submitted.caseId;
    $('submitDate').textContent = new Date(S.submitted.at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    $('tlSubmitted').textContent = fmtStamp(S.submitted.at);
  }
  function celebrate(power) {
    if (typeof window.confetti !== 'function') return;
    var colors = ['--primary-500', '--primary-300', '--secondary-400', '--secondary-300', '--info-400'].map(cssVar).filter(Boolean);
    window.confetti({ particleCount: Math.round(160 * power), spread: 80, startVelocity: 42, origin: { y: 0.3 }, colors: colors, disableForReducedMotion: true });
    if (power >= 1) {
      setTimeout(function () {
        window.confetti({ particleCount: 70, angle: 60, spread: 60, origin: { x: 0, y: 0.6 }, colors: colors, disableForReducedMotion: true });
        window.confetti({ particleCount: 70, angle: 120, spread: 60, origin: { x: 1, y: 0.6 }, colors: colors, disableForReducedMotion: true });
      }, 300);
    }
  }

  /* ------------------------------------------------------------------ autosave */
  var saveTimer, saveFailed = false;
  function collect() {
    var values = {};
    document.querySelectorAll('.ob-step input').forEach(function (el) {
      if (el.type === 'file' || el.name === 'exq' || el.id === 'stateSearch') return;
      if (el.type === 'radio') { if (el.checked) values['r:' + el.name] = el.value; }
      else if (el.type === 'checkbox') { if (el.id) values['c:' + el.id] = el.checked; }
      else if (el.id && !el.readOnly) values[el.id] = el.value;
      else if (el.id && (el.id === 'piBizCity' || el.id === 'piBizState')) values[el.id] = el.value;
    });
    return values;
  }
  function persist() {
    var chip = $('saveStatus');
    chip.classList.add('is-saving');
    chip.querySelector('.ob-save-text').textContent = 'Saving...';
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify({ v: 2, savedAt: Date.now(), S: S, values: collect() }));
        chip.classList.remove('is-saving');
        chip.querySelector('.ob-save-text').textContent = 'All changes saved';
        chip.title = 'Saved on this device at ' + new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      } catch (e) {
        chip.classList.remove('is-saving');
        chip.querySelector('.ob-save-text').textContent = 'Not saved';
        chip.style.color = 'var(--warning-800)';
        if (!saveFailed) {
          saveFailed = true;
          MX.toast({ type: 'warning', title: 'Progress is not being saved', message: 'Your browser blocked storage (private mode?). Keep this tab open until you submit.', duration: 0 });
        }
      }
      renderNav();
    }, 450);
  }
  function readSaved() {
    try { var raw = localStorage.getItem(STORE_KEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  }
  function restore(data) {
    var saved = data.S || {};
    Object.keys(freshState()).forEach(function (k) { if (saved[k] !== undefined) S[k] = saved[k]; });
    var v = data.values || {};
    Object.keys(v).forEach(function (k) {
      if (k.indexOf('r:') === 0) setRadio(k.slice(2), v[k]);
      else if (k.indexOf('c:') === 0) setCheck(k.slice(2), v[k]);
    });
    Object.keys(v).forEach(function (k) {
      if (k.indexOf(':') === 1) return;
      var el = $(k);
      if (el) MX.setValue(el, v[k]);
    });
    zipLookup();
    if (v.piBizCity && !ZIPS[val('piBizZip')]) { MX.setValue('piBizCity', v.piBizCity); MX.setValue('piBizState', v.piBizState); }
    if (S.npnStatus === 'found') { renderRecord(); $('niprPrefillNote').hidden = false; $('niprBadgeName').hidden = false; $('niprBadgeAddr').hidden = false; $('regNPN').closest('.mx-field').classList.add('is-valid'); }
    else S.npnStatus = '';
    if (S.files.w9) dz.w9.set(S.files.w9);
    if (S.files.void) dz.void.set(S.files.void);
    if (S.files.ahip) dz.ahip.set(S.files.ahip);
    syncEntity(); syncW9Mode(); syncPay(); syncRouting(); syncAhip(); renderStates(); renderBgTimeline();
    if (S.contractRead) markContractRead();
    if (v['c:contractRead']) $('contractRead').checked = true;
    renderSubmitted();
    obGoTo(S.step, true);
  }
  function clearSaved() { try { localStorage.removeItem(STORE_KEY); } catch (e) { /* ignore */ } }

  window.obSaveExit = function () {
    MX.dialog({ tone: 'primary', icon: 'cloud-check-bold-duotone', title: 'Save and exit?',
      message: 'Your progress is saved on this device. Open the link in your invitation email any time to pick up where you left off.',
      actions: [{ label: 'Stay', variant: 'outlined', value: null }, { label: 'Save & exit', variant: 'contained', value: true }]
    }).then(function (v) { if (v) { persist(); setTimeout(function () { location.href = '../auth/login.html'; }, 500); } });
  };
  window.obStartOver = function () {
    MX.dialog({ tone: 'error', icon: 'restart-bold', title: 'Start over?',
      message: 'This clears everything you entered on this device, including training scores. This cannot be undone.',
      actions: [{ label: 'Cancel', variant: 'outlined', value: null }, { label: 'Clear and start over', variant: 'contained', color: 'error', value: true }]
    }).then(function (v) { if (v) { clearSaved(); location.href = location.pathname + '?fresh=1'; } });
  };

  /* ------------------------------------------------------------------ demo fill */
  window.prefillStep = function (step) {
    if (step == null) step = S.step;
    var p = Promise.resolve();
    if (step === 0) {
      MX.setValue('regNPN', '88234410');
      p = obLookupNPN(true);
    } else if (step === 1) {
      if (S.npnStatus !== 'found') { MX.setValue('regNPN', '88234410'); S.npn = '88234410'; S.npnStatus = 'found'; renderRecord(); applyNipr(); }
      ['piFirst', 'piMI', 'piLast', 'piBizStreet', 'piBizSuite'].forEach(function (id) {
        var d = { piFirst: 'James', piMI: 'R', piLast: 'Martinez', piBizStreet: '1801 NW 9th Ave', piBizSuite: 'Suite 210' }[id];
        if (!val(id)) MX.setValue(id, d);
      });
      MX.setValue('piBizZip', '33136'); zipLookup();
      MX.setValue('piDOB', '03/12/1985'); MX.setValue('piPhone', '7865550147');
      setCheck('piSMS', true); setCheck('piEmailConsent', true);
    } else if (step === 2) {
      setRadio('taxEntity', 'individual');
      MX.setValue('taxTIN', '123454589');
      setCheck('taxSameName', true);
      setRadio('w9Mode', 'esign'); setCheck('w9Certify', true);
      setRadio('payMethod', 'ach');
      MX.setValue('bankRouting', '021000021'); syncRouting();
      MX.setValue('bankAcct', '000123457832'); MX.setValue('bankAcct2', '000123457832');
      setRadio('bankAcctType', 'Checking');
    } else if (step === 3) {
      MX.setValue('ahipCert', 'AH2026-88421'); MX.setValue('ahipDate', '01/15/2026'); syncAhip();
      ['FL', 'TX'].forEach(function (c) { if (S.states.indexOf(c) === -1) S.states.push(c); });
      renderStates();
    } else if (step === 4) {
      if (E) closeExam(true);
      S.exam = { best: [100, 100, 80, 100], last: [100, 100, 80, 100], attempts: [1, 1, 1, 1], times: [72000, 95000, 64000, 51000] };
      renderTraining();
    } else if (step === 5) {
      setCheck('bgConsent', true);
      p = sendBgInvitation(true);
    } else if (step === 6) {
      markContractRead();
      setCheck('contractRead', true);
      MX.setValue('eSigName', legalName() || 'James R Martinez');
      syncSig();
      renderReview();
    }
    return p.then(function () {
      var root = stepEl(step);
      if (root) {
        root.querySelectorAll('[data-rules]').forEach(function (el) { if (el.value) MX.validateField(el); });
        root.querySelectorAll('.mx-group-error').forEach(function (g) { g.classList.remove('is-visible'); });
        root.querySelectorAll('.is-invalid').forEach(function (g) { if (!g.classList.contains('mx-field')) g.classList.remove('is-invalid'); });
      }
      hideSummary(step);
      S.skipped[step] = false;
      renderNav();
      persist();
    });
  };

  /* ------------------------------------------------------------------ nav drawer */
  function setNav(open) {
    var shell = $('appShell');
    shell.classList.toggle('nav-open', !!open);
    $('navOpen').setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
  }

  /* ------------------------------------------------------------------ wiring */
  function wire() {
    MX.bindForm(document);

    $('navOpen').addEventListener('click', function () { setNav(true); });
    var setMini = function (on) {
      $('appShell').classList.toggle('nav-mini', on);
      var b = $('navMini'), label = on ? 'Expand sidebar' : 'Collapse sidebar';
      b.setAttribute('aria-label', label); b.title = label; b.setAttribute('aria-expanded', on ? 'false' : 'true');
      try { localStorage.setItem('ea.navMini', on ? '1' : '0'); } catch (e) { /* per-device preference only */ }
    };
    try { if (localStorage.getItem('ea.navMini') === '1') setMini(true); } catch (e) { /* ignore */ }
    $('navMini').addEventListener('click', function () { setMini(!$('appShell').classList.contains('nav-mini')); });
    $('navClose').addEventListener('click', function () { setNav(false); });
    $('navBackdrop').addEventListener('click', function () { setNav(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setNav(false); });
    MX.popover($('userBtn'), $('userPop'));
    $('demoFill').addEventListener('click', function () {
      if (S.step === 7) return MX.toast({ type: 'info', title: 'Nothing to fill', message: 'Your application is already submitted.' });
      prefillStep(S.step).then(function () { MX.toast({ type: 'primary', icon: 'magic-stick-3-bold-duotone', title: 'Sample data added', message: STEPS[S.step].title + ' is filled in. Prototype only.' }); });
    });
    $('bellBtn').addEventListener('click', function () {
      MX.toast({ type: 'info', icon: 'bell-bing-bold-duotone', title: '2 updates', message: 'HealthFirst Distribution accepted your invite. AHIP for plan year 2027 opens Jun 2027.' });
    });
    $('copyInvite').addEventListener('click', function () {
      var code = 'EA-INV-2026-0847';
      var ok = function () { MX.toast({ type: 'success', title: 'Invite code copied', message: code }); };
      var fail = function () { MX.toast({ type: 'error', title: 'Could not copy', message: 'Select the code and copy it with Ctrl+C or Cmd+C.' }); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(ok, fail); else fail();
    });

    /* step 0 */
    $('regNPN').addEventListener('input', function () { if (S.npnStatus) resetNpn(); });
    $('regNPN').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); obLookupNPN(); } });
    document.querySelectorAll('[data-npn]').forEach(function (c) {
      c.setAttribute('role', 'button');
      c.setAttribute('tabindex', '0');
      var go = function () { MX.setValue('regNPN', c.getAttribute('data-npn')); resetNpn(); obLookupNPN(); };
      c.addEventListener('click', go);
      c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });

    /* step 1 */
    $('piBizZip').addEventListener('input', zipLookup);
    $('piBizState').addEventListener('input', function () { this.value = this.value.toUpperCase().replace(/[^A-Z]/g, ''); });
    MX.customRule($('piBizState'), function (v) { return !v || STATE_NAME[v.toUpperCase()] ? '' : 'Use a 2-letter state code, like FL.'; });

    /* step 2 */
    document.querySelectorAll('input[name=taxEntity]').forEach(function (r) { r.addEventListener('change', syncEntity); });
    document.querySelectorAll('input[name=w9Mode]').forEach(function (r) { r.addEventListener('change', syncW9Mode); });
    document.querySelectorAll('input[name=payMethod]').forEach(function (r) { r.addEventListener('change', syncPay); });
    $('taxSameName').addEventListener('change', function () { $('taxNameField').hidden = this.checked; syncTaxText(); });
    $('taxTIN').addEventListener('input', syncTaxText);
    $('taxName').addEventListener('input', syncTaxText);
    $('w9Certify').addEventListener('change', function () { if (this.checked) clearGroupError('w9CertErr', $('w9CertifyRow')); });
    $('checkSameAddr').addEventListener('change', syncPay);
    $('bankRouting').addEventListener('input', syncRouting);
    $('bankAcct').addEventListener('input', function () { if ($('bankAcct2').value) { $('bankAcct2')._mxTouched = true; MX.validateField($('bankAcct2')); } });
    dz.w9 = MX.dropzone($('w9Zone'), { accept: ['pdf'], maxMB: 5, list: $('w9List'), errorEl: $('w9Err'), onChange: function (f) { S.files.w9 = f; if (f) clearGroupError('w9Err'); persist(); } });
    dz.void = MX.dropzone($('voidZone'), { accept: ['pdf', 'jpg', 'jpeg', 'png'], maxMB: 5, list: $('voidList'), errorEl: $('voidErr'), onChange: function (f) { S.files.void = f; persist(); } });

    /* step 3 */
    $('ahipDate').addEventListener('input', syncAhip);
    MX.customRule($('ahipDate'), function (v) {
      var d = MX.parseUSDate(v);
      if (!d) return '';
      var x = new Date(d.getFullYear() + 1, d.getMonth(), d.getDate());
      if (x < new Date()) return 'This certificate expired on ' + MX.formatUSDate(x) + '. Complete AHIP for the current plan year first.';
      if (d.getFullYear() < 2000) return 'Check the year. AHIP dates start in 2000.';
      return '';
    });
    dz.ahip = MX.dropzone($('ahipZone'), { accept: ['pdf'], maxMB: 5, list: $('ahipList'), errorEl: $('ahipErr'), onChange: function (f) { S.files.ahip = f; persist(); } });
    setupStateCombo();

    /* step 5 */
    $('bgConsent').addEventListener('change', function () { if (this.checked) showGroupError('bgConsentErr', ''); renderNav(); });

    /* step 6 */
    $('contractDoc').addEventListener('scroll', function () {
      var d = this, pct = d.scrollTop / Math.max(1, d.scrollHeight - d.clientHeight);
      if (!S.contractRead) $('contractReadBar').style.width = Math.round(pct * 100) + '%';
      if (pct > 0.97 && !S.contractRead) { markContractRead(); persist(); }
    });
    $('contractReadRow').addEventListener('click', function () {
      if ($('contractRead').disabled) {
        showGroupError('contractReadErr', 'Scroll through the whole agreement first. Signing unlocks at the end.');
        var doc = $('contractDoc');
        doc.scrollBy({ top: 60, behavior: 'smooth' });
        doc.focus({ preventScroll: true });
      }
    });
    $('contractRead').addEventListener('change', function () { if (this.checked) clearGroupError('contractReadErr', $('contractReadRow')); });
    $('eSigName').addEventListener('input', syncSig);
    MX.customRule($('eSigName'), function (v) {
      var ln = legalName();
      if (!v || !ln) return '';
      var a = normName(v), b = normName(ln), noMid = normName(val('piFirst') + ' ' + val('piLast'));
      return a === b || a === noMid ? '' : 'Type your name exactly as "' + ln + '".';
    });

    /* any change -> autosave + live nav status */
    document.querySelectorAll('.ob-step').forEach(function (sec) {
      sec.addEventListener('input', function (e) { if (e.target.name !== 'exq' && e.target.id !== 'stateSearch') persist(); });
      var refresh = function (e) {
        if (e.target.name === 'exq' || e.target.id === 'stateSearch') return;
        var n = +sec.getAttribute('data-step');
        var box = sec.querySelector('.mx-error-summary');
        if (!box || box.hidden) return;
        var left = stepErrors(n, false);
        if (!left.length) hideSummary(n);
        else if (n !== 6) showSummary(n, left, { live: true });
      };
      sec.addEventListener('change', function (e) { refresh(e); if (e.target.name !== 'exq') persist(); });
      sec.addEventListener('focusout', refresh);
    });

    window.addEventListener('offline', function () { MX.toast({ type: 'warning', title: 'You are offline', message: 'Keep going. We save on this device and sync when you are back.', duration: 0 }); });
    window.addEventListener('online', function () { MX.toast({ type: 'success', title: 'Back online' }); });
  }

  /* ------------------------------------------------------------------ boot */
  function boot() {
    buildChrome();
    wire();
    renderStates();
    renderStepMeta();
    renderNav();
    var fresh = /[?&]fresh=1/.test(location.search) || /[?&]run=/.test(location.search);
    var saved = fresh ? null : readSaved();
    if (fresh) clearSaved();
    if (!saved) { $('saveStatus').querySelector('.ob-save-text').textContent = 'Autosave on'; return; }
    if (saved.S && saved.S.submitted) { restore(saved); return; }
    var st = (saved.S && saved.S.step) || 0;
    var hasData = st > 0 || Object.keys(saved.values || {}).some(function (k) { return saved.values[k] && k.indexOf('c:') !== 0; });
    if (!hasData) return;
    MX.dialog({ tone: 'primary', icon: 'cloud-check-bold-duotone', title: 'Welcome back, James', persistent: true,
      html: '<p style="margin:0">You stopped at <strong>' + esc(STEPS[st].title) + '</strong> (step ' + (st + 1) + ' of ' + TOTAL + '), last saved ' + esc(fmtStamp(saved.savedAt)) + '. Pick up where you left off?</p>',
      actions: [{ label: 'Start over', variant: 'outlined', value: 'new' }, { label: 'Resume', variant: 'contained', value: 'resume' }]
    }).then(function (v) {
      if (v === 'new') { clearSaved(); persist(); MX.toast({ type: 'info', title: 'Starting fresh' }); }
      else { restore(saved); MX.toast({ type: 'primary', icon: 'cloud-check-bold-duotone', title: 'Progress restored', message: 'Uploaded files are kept by name only. Re-attach them if asked.' }); }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();

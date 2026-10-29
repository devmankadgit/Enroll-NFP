/**
 * EnrollAxis NFP — Shared Button Actions & Navigation
 * Provides working button behaviors for the non-functional prototype
 */

// ═══════════════════════════════════════════════════════
// TOAST NOTIFICATION SYSTEM
// ═══════════════════════════════════════════════════════
(function() {
  // Create toast container
  var container = document.createElement('div');
  container.id = 'nfp-toast-container';
  container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:99999;display:flex;flex-direction:column;gap:8px;pointer-events:none';
  document.body.appendChild(container);
})();

function showToast(message, type) {
  type = type || 'success';
  function tok(name, fallback) {
    try {
      var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return v || fallback;
    } catch (e) { return fallback; }
  }
  var colors = {
    success: {
      bg: tok('--success-50', '#ECFDF2'),
      border: tok('--success-200', '#B5F7CC'),
      color: tok('--success-700', '#1B9D48'),
      icon: 'fa-check-circle'
    },
    info: {
      bg: tok('--info-50', '#ECF8FD'),
      border: tok('--info-200', '#B5E5F7'),
      color: tok('--info-700', '#127EA5'),
      icon: 'fa-info-circle'
    },
    warning: {
      bg: tok('--warning-50', '#FEF9EB'),
      border: tok('--warning-200', '#FBE8B1'),
      color: '#876707',
      icon: 'fa-exclamation-triangle'
    },
    error: {
      bg: tok('--danger-50', '#FDECEC'),
      border: tok('--danger-200', '#F7B5B5'),
      color: tok('--danger-700', '#9D1B1B'),
      icon: 'fa-times-circle'
    }
  };
  var c = colors[type] || colors.success;
  var toast = document.createElement('div');
  toast.style.cssText = 'background:' + c.bg + ';border:1px solid ' + c.border + ';color:' + c.color + ';padding:12px 18px;border-radius:10px;font-size:13px;font-weight:500;display:flex;align-items:center;gap:10px;box-shadow:0 4px 16px rgba(0,0,0,.12);pointer-events:auto;animation:nfpSlideIn .3s ease;max-width:380px';
  toast.innerHTML = '<i class="fas ' + c.icon + '" style="font-size:16px;flex-shrink:0"></i><span>' + message + '</span>';
  document.getElementById('nfp-toast-container').appendChild(toast);
  setTimeout(function() {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all .3s ease';
    setTimeout(function() { toast.remove(); }, 300);
  }, 3000);
}

// Add animation keyframe
var style = document.createElement('style');
style.textContent = '@keyframes nfpSlideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}';
document.head.appendChild(style);

// ═══════════════════════════════════════════════════════
// ZIP CODE LOOKUP — Auto-fill City, State, County
// ═══════════════════════════════════════════════════════
var NFP_ZIP_MAP = {
  '33101':{city:'Miami',state:'FL',county:'Miami-Dade'},'33126':{city:'Miami',state:'FL',county:'Miami-Dade'},
  '33136':{city:'Miami',state:'FL',county:'Miami-Dade'},'33139':{city:'Miami Beach',state:'FL',county:'Miami-Dade'},
  '33150':{city:'Miami',state:'FL',county:'Miami-Dade'},'33125':{city:'Miami',state:'FL',county:'Miami-Dade'},
  '33130':{city:'Miami',state:'FL',county:'Miami-Dade'},'33142':{city:'Miami',state:'FL',county:'Miami-Dade'},
  '33109':{city:'Miami Beach',state:'FL',county:'Miami-Dade'},'33131':{city:'Miami',state:'FL',county:'Miami-Dade'},
  '33010':{city:'Hialeah',state:'FL',county:'Miami-Dade'},'33012':{city:'Hialeah',state:'FL',county:'Miami-Dade'},
  '33301':{city:'Fort Lauderdale',state:'FL',county:'Broward'},'33304':{city:'Fort Lauderdale',state:'FL',county:'Broward'},
  '33309':{city:'Fort Lauderdale',state:'FL',county:'Broward'},
  '33401':{city:'West Palm Beach',state:'FL',county:'Palm Beach'},'33409':{city:'West Palm Beach',state:'FL',county:'Palm Beach'},
  '33602':{city:'Tampa',state:'FL',county:'Hillsborough'},'33607':{city:'Tampa',state:'FL',county:'Hillsborough'},
  '32801':{city:'Orlando',state:'FL',county:'Orange'},'32803':{city:'Orlando',state:'FL',county:'Orange'},
  '30301':{city:'Atlanta',state:'GA',county:'Fulton'},'30309':{city:'Atlanta',state:'GA',county:'Fulton'},
  '30318':{city:'Atlanta',state:'GA',county:'Fulton'},'30303':{city:'Atlanta',state:'GA',county:'Fulton'},
  '30030':{city:'Decatur',state:'GA',county:'DeKalb'},'30032':{city:'Decatur',state:'GA',county:'DeKalb'},
  '75201':{city:'Dallas',state:'TX',county:'Dallas'},'75202':{city:'Dallas',state:'TX',county:'Dallas'},
  '77001':{city:'Houston',state:'TX',county:'Harris'},'77002':{city:'Houston',state:'TX',county:'Harris'},
  '10001':{city:'New York',state:'NY',county:'New York'},'10016':{city:'New York',state:'NY',county:'New York'},
  '90001':{city:'Los Angeles',state:'CA',county:'Los Angeles'},'60601':{city:'Chicago',state:'IL',county:'Cook'}
};
function nfpZipLookup(zipValue, cityId, stateId, countyId) {
  var zip = (typeof zipValue === 'object') ? zipValue.value.trim() : zipValue.trim();
  var data = NFP_ZIP_MAP[zip];
  if (!data && zip.length >= 3) {
    var prefix = zip.substring(0,3);
    var prefixMap = {'331':'Miami','330':'Fort Lauderdale','303':'Atlanta','300':'Decatur','770':'Houston','750':'Dallas','334':'West Palm Beach','336':'Tampa','328':'Orlando'};
    var stateMap = {'331':'FL','330':'FL','303':'GA','300':'GA','770':'TX','750':'TX','334':'FL','336':'FL','328':'FL'};
    var countyMap = {'331':'Miami-Dade','330':'Broward','303':'Fulton','300':'DeKalb','770':'Harris','750':'Dallas','334':'Palm Beach','336':'Hillsborough','328':'Orange'};
    if (prefixMap[prefix]) data = {city:prefixMap[prefix],state:stateMap[prefix],county:countyMap[prefix]};
  }
  var cityEl = cityId ? document.getElementById(cityId) : null;
  var stateEl = stateId ? document.getElementById(stateId) : null;
  var countyEl = countyId ? document.getElementById(countyId) : null;
  if (cityEl) cityEl.value = data ? data.city : '';
  if (stateEl) stateEl.value = data ? data.state : '';
  if (countyEl) countyEl.value = data ? data.county : '';
  return data || null;
}

// ═══════════════════════════════════════════════════════
// PAGE NAVIGATION (Next/Previous in same portal)
// ═══════════════════════════════════════════════════════
var NAV_MAPS = {
  'agent': ['dashboard.html','leads.html','lead-detail.html','campaigns.html','bob.html','action-items.html','soa-form.html','enrollment.html','pqat.html','plan-recommendation.html','enrollment-status.html','hra-management.html','member-profile.html','commissions.html','payments.html','payment-preferences.html','documents.html','notifications.html','profile.html','onboarding.html','onboarding-form.html','training-exam.html','my-hierarchy.html'],
  'admin': ['dashboard.html','users.html','roles.html','hierarchy.html','carrier-setup.html','plan-catalog.html','commission-rules.html','campaigns.html','templates.html','training-admin.html','compliance-rules.html','document-lifecycle.html','integrations.html','feature-toggles.html','auth-config.html','monitoring.html','notifications-config.html','master-data.html','reports.html','exceptions.html','nipr-alerts.html','agent-feed.html','agent-lifecycle.html','access-restrictions.html','onboarding-docs-config.html','module-summaries.html'],
  'enrollment-ops': ['dashboard.html','processing-hub.html','compliance-tracker.html','csnp-review.html','document-repository.html','id-cards.html'],
  'finance': ['ach-nacha.html','banking-gap.html','batch-detail.html','batch-review.html','batches.html','bob-ledger.html','calc-audit.html','calc-engine.html','chargebacks.html','commission-admin.html','commission-config.html','dashboard.html','disputes.html','hra-review.html','patient-activation-fees.html','reconciliation.html','remittance.html','reports.html','state-reporting.html'],
  'member': ['dashboard.html','dtc-enrollment.html'],
  'compliance': ['audit-trail.html','compliance-hold.html','export-panel.html','reactivation.html'],
  'agency-admin': ['action-items.html','agents.html','bob.html','bulletin-board.html','campaigns.html','commissions.html','dashboard.html','hierarchy-view.html','invitations.html','leads.html','member-profile.html','onboarding-cases.html','soa-management.html'],
  'agency-onboarding': ['add-agent.html','agency-admin-setup.html','create-agency.html','direct-contracting.html','genesis-integration.html','incentive-tracking.html','intake-form.html','review-queue.html','tfn-mapping.html']
};

function getPortalAndPage() {
  var path = window.location.pathname.replace(/\\/g, '/');
  var parts = path.split('/');
  var file = parts[parts.length - 1];
  var folder = parts[parts.length - 2];
  return { folder: folder, file: file };
}

function navNext() {
  var info = getPortalAndPage();
  var pages = NAV_MAPS[info.folder];
  if (!pages) { history.forward(); return; }
  var idx = pages.indexOf(info.file);
  if (idx >= 0 && idx < pages.length - 1) {
    window.location.href = pages[idx + 1];
  } else {
    showToast('You are on the last page of this section', 'info');
  }
}

function navPrev() {
  var info = getPortalAndPage();
  var pages = NAV_MAPS[info.folder];
  if (!pages) { history.back(); return; }
  var idx = pages.indexOf(info.file);
  if (idx > 0) {
    window.location.href = pages[idx - 1];
  } else {
    history.back();
  }
}

// ═══════════════════════════════════════════════════════
// SIMULATED ACTIONS (replaces alert() calls)
// ═══════════════════════════════════════════════════════
function nfpSave(what) {
  showToast((what || 'Changes') + ' saved successfully', 'success');
}

function nfpSubmit(what) {
  showToast((what || 'Form') + ' submitted successfully', 'success');
}

function nfpExport(what) {
  showToast((what || 'Report') + ' exported - download starting...', 'info');
}

function nfpApprove(what) {
  showToast((what || 'Item') + ' approved successfully', 'success');
}

function nfpReject(what) {
  showToast((what || 'Item') + ' has been rejected', 'warning');
}

function nfpDelete(what) {
  if (confirm('Are you sure you want to delete ' + (what || 'this item') + '?')) {
    showToast((what || 'Item') + ' deleted', 'warning');
    return true;
  }
  return false;
}

function nfpSend(what) {
  showToast((what || 'Message') + ' sent successfully', 'success');
}

function nfpAction(message, type) {
  showToast(message, type || 'success');
}

// ═══════════════════════════════════════════════════════
// AUTO-WIRE: Fix page-nav-bar buttons on load
// ═══════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function() {
  // Fix page-nav-bar Back/Next buttons
  var navBar = document.querySelector('.page-nav-bar');
  if (navBar) {
    var buttons = navBar.querySelectorAll('button');
    buttons.forEach(function(btn) {
      if (btn.textContent.trim().indexOf('Back') >= 0 || btn.innerHTML.indexOf('fa-arrow-left') >= 0) {
        btn.onclick = function() { navPrev(); };
      }
      if (btn.textContent.trim().indexOf('Next') >= 0 || btn.innerHTML.indexOf('fa-arrow-right') >= 0) {
        btn.onclick = function() { navNext(); };
      }
    });
  }

  // Auto-wire ALL buttons without onclick handlers
  document.querySelectorAll('button').forEach(function(btn) {
    // Skip buttons that already have handlers
    if (btn.onclick || btn.getAttribute('onclick') || btn.type === 'submit') return;
    // Skip buttons inside training-exam (handled by exam JS)
    if (btn.closest('#exam-nav-bar') || btn.closest('.exam-page')) return;
    
    var text = btn.textContent.trim().toLowerCase();
    var icon = btn.querySelector('i');
    var iconClass = icon ? icon.className : '';
    
    var action = null;
    
    // Determine action based on text or icon
    if (text.match(/save|update/)) { action = function() { nfpSave('Changes'); }; }
    else if (text.match(/submit|send|resend|create|add|invite|provision/)) { action = function() { nfpSubmit('Request'); }; }
    else if (text.match(/export|download/) || iconClass.match(/fa-download|fa-file-export/)) { action = function() { nfpExport('Data'); }; }
    else if (text.match(/approve|confirm|accept|complete|verify/)) { action = function() { nfpApprove('Item'); }; }
    else if (text.match(/reject|deny|cancel|remove|delete|revoke|terminate/)) { action = function() { nfpReject('Item'); }; }
    else if (text.match(/filter|search|find|apply|lookup/) || iconClass.match(/fa-filter|fa-search/)) { action = function() { showToast('Filters applied', 'info'); }; }
    else if (text.match(/refresh|reload|sync|retry/) || iconClass.match(/fa-sync/)) { action = function() { showToast('Data refreshed', 'info'); }; }
    else if (text.match(/upload/) || iconClass.match(/fa-upload/)) { action = function() { showToast('Upload initiated', 'info'); }; }
    else if (text.match(/print/) || iconClass.match(/fa-print/)) { action = function() { window.print(); }; }
    else if (text.match(/view|open|detail|expand/) || iconClass.match(/fa-eye|fa-external/)) { action = function() { showToast('Opening detail view', 'info'); }; }
    else if (text.match(/edit|modify|change/) || iconClass.match(/fa-edit|fa-pen/)) { action = function() { showToast('Edit mode enabled', 'info'); }; }
    else if (text.match(/copy|clone|duplicate/)) { action = function() { showToast('Copied to clipboard', 'success'); }; }
    else if (text.match(/assign|reassign|transfer/)) { action = function() { showToast('Reassignment complete', 'success'); }; }
    else if (text.match(/remind|notify/) || iconClass.match(/fa-bell/)) { action = function() { nfpSend('Reminder'); }; }
    else if (text.match(/renew/)) { action = function() { showToast('Renewal initiated', 'info'); }; }
    else if (text.match(/prev|back/) || iconClass.match(/fa-arrow-left|fa-chevron-left/)) { action = function() { showToast('Previous page', 'info'); }; }
    else if (text.match(/next|forward/) || iconClass.match(/fa-arrow-right|fa-chevron-right/)) { action = function() { showToast('Next page', 'info'); }; }
    else if (iconClass.match(/fa-file-pdf/)) { action = function() { nfpExport('PDF Document'); }; }
    else if (iconClass.match(/fa-paper-plane/)) { action = function() { nfpSend('Message'); }; }
    else if (iconClass.match(/fa-save/)) { action = function() { nfpSave('Changes'); }; }
    else if (iconClass.match(/fa-plus/)) { action = function() { nfpSubmit('New item created'); }; }
    else if (iconClass.match(/fa-trash|fa-times/)) { action = function() { nfpReject('Item'); }; }
    else { action = function() { showToast('Action completed', 'success'); }; }
    
    if (action) {
      btn.addEventListener('click', action);
    }
  });
});

// ═══════════════════════════════════════════════════════
// MODAL HELPERS
// ═══════════════════════════════════════════════════════
function nfpCloseModal(id) {
  var modal = document.getElementById(id);
  if (modal) modal.style.display = 'none';
}

function nfpOpenModal(id) {
  var modal = document.getElementById(id);
  if (modal) modal.style.display = 'flex';
}

// ═══════════════════════════════════════════════════════
// TAB SWITCHING HELPER
// ═══════════════════════════════════════════════════════
function nfpSwitchTab(tabGroupId, activeIdx) {
  var group = document.getElementById(tabGroupId);
  if (!group) return;
  var tabs = group.querySelectorAll('[data-tab]');
  var panes = group.querySelectorAll('[data-tab-pane]');
  tabs.forEach(function(t, i) {
    t.classList.toggle('active', i === activeIdx);
  });
  panes.forEach(function(p, i) {
    p.style.display = (i === activeIdx) ? 'block' : 'none';
  });
}

// ═══════════════════════════════════════════════════════
// MOBILE SIDEBAR TOGGLE (PWA Responsive)
// ═══════════════════════════════════════════════════════
(function() {
  var sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;

  // Create toggle button
  var toggleBtn = document.createElement('button');
  toggleBtn.className = 'sidebar-toggle';
  toggleBtn.setAttribute('aria-label', 'Toggle menu');
  toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
  document.body.appendChild(toggleBtn);

  // Create overlay
  var overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  document.body.appendChild(overlay);

  function openSidebar() {
    sidebar.classList.add('open');
    overlay.classList.add('active');
    toggleBtn.innerHTML = '<i class="fas fa-times"></i>';
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
    toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
  }

  toggleBtn.addEventListener('click', function() {
    if (sidebar.classList.contains('open')) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  overlay.addEventListener('click', closeSidebar);

  // Close sidebar on navigation (link click)
  sidebar.querySelectorAll('a').forEach(function(link) {
    link.addEventListener('click', function() {
      if (window.innerWidth <= 768) closeSidebar();
    });
  });

  // Close sidebar on resize to desktop
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) closeSidebar();
  });
})();

// ═══════════════════════════════════════════════════════
// AUTO-PAGINATION FOR LISTING TABLES
// ═══════════════════════════════════════════════════════
(function() {
  var ROWS_PER_PAGE = 10;

  document.addEventListener('DOMContentLoaded', function() {
    var tables = document.querySelectorAll('table.tbl, table.table');
    tables.forEach(function(table) {
      var tbody = table.querySelector('tbody');
      if (!tbody) return;
      var rows = tbody.querySelectorAll('tr');
      if (rows.length <= ROWS_PER_PAGE) return;
      // Skip tables that already have custom pagination
      if (table.closest('[data-no-paginate]')) return;
      if (table.id && document.querySelector('[data-paginate-skip="' + table.id + '"]')) return;

      var totalRows = rows.length;
      var totalPages = Math.ceil(totalRows / ROWS_PER_PAGE);
      var currentPage = 1;

      // Create pagination bar
      var pgBar = document.createElement('div');
      pgBar.className = 'nfp-pagination';
      // Insert after the table's closest wrapper
      var wrapper = table.closest('.table-wrap') || table.closest('.card-body') || table.parentNode;
      if (wrapper && wrapper !== table.parentNode) {
        wrapper.appendChild(pgBar);
      } else {
        table.parentNode.insertBefore(pgBar, table.nextSibling);
      }

      function renderPagination() {
        var start = (currentPage - 1) * ROWS_PER_PAGE + 1;
        var end = Math.min(currentPage * ROWS_PER_PAGE, totalRows);
        var html = '<span class="pg-info">Showing ' + start + '–' + end + ' of ' + totalRows + '</span>';
        html += '<span class="pg-controls">';
        html += '<span class="pg-btn' + (currentPage === 1 ? ' disabled' : '') + '" data-pg="prev"><i class="fas fa-chevron-left"></i></span>';
        var startPage = Math.max(1, currentPage - 2);
        var endPage = Math.min(totalPages, startPage + 4);
        if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);
        for (var i = startPage; i <= endPage; i++) {
          html += '<span class="pg-btn' + (i === currentPage ? ' active' : '') + '" data-pg="' + i + '">' + i + '</span>';
        }
        html += '<span class="pg-btn' + (currentPage === totalPages ? ' disabled' : '') + '" data-pg="next"><i class="fas fa-chevron-right"></i></span>';
        html += '</span>';
        pgBar.innerHTML = html;
      }

      function showPage(page) {
        currentPage = page;
        var start = (page - 1) * ROWS_PER_PAGE;
        var end = start + ROWS_PER_PAGE;
        rows.forEach(function(row, idx) {
          row.style.display = (idx >= start && idx < end) ? '' : 'none';
        });
        renderPagination();
      }

      pgBar.addEventListener('click', function(e) {
        var btn = e.target.closest('.pg-btn');
        if (!btn || btn.classList.contains('disabled') || btn.classList.contains('active')) return;
        var pg = btn.getAttribute('data-pg');
        if (pg === 'prev') showPage(currentPage - 1);
        else if (pg === 'next') showPage(currentPage + 1);
        else showPage(parseInt(pg));
      });

      showPage(1);
    });
  });
})();

// ═══════════════════════════════════════════════════════
// EXPORT TABLE TO EXCEL (CSV download)
// ═══════════════════════════════════════════════════════
function exportTableToExcel(tableId, filename) {
  var table = document.getElementById(tableId);
  if (!table) { showToast('Table not found.', 'error'); return; }
  var rows = table.querySelectorAll('tr');
  var csv = [];
  rows.forEach(function(row) {
    var cols = row.querySelectorAll('th, td');
    var rowData = [];
    cols.forEach(function(col) {
      // Skip action columns (last column with buttons)
      if (col.querySelector('button') && col.cellIndex === cols.length - 1) return;
      var text = col.innerText.replace(/"/g, '""').replace(/\n/g, ' ').trim();
      rowData.push('"' + text + '"');
    });
    csv.push(rowData.join(','));
  });
  var csvContent = '\uFEFF' + csv.join('\n');
  var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  var link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = (filename || 'export') + '_' + new Date().toISOString().slice(0, 10) + '.csv';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Exported "' + (filename || 'data') + '" to Excel (CSV).', 'success');
}

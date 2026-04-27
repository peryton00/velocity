/**
 * SHARED UTILITIES
 * VELOCITY CYCLES Inventory Management System
 */
import { checkSession, logout } from './auth.js';

// ── TOAST NOTIFICATIONS ──
export function showToast(message, type = 'success', duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = {
    success: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    error:   '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    info:    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    warning: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `${icons[type] || ''}<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity .3s, transform .3s';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ── MODAL HELPERS ──
export function openModal(modalId) {
  const el = document.getElementById(modalId);
  if (el) el.classList.add('open');
}

export function closeModal(modalId) {
  const el = document.getElementById(modalId);
  if (el) el.classList.remove('open');
}

// ── FORMAT HELPERS ──
export function fmtCurrency(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function fmtDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ── VALIDATION ──
export function validateGSTIN(gstin) {
  const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return regex.test(gstin);
}

export function validatePhone(phone) {
  return /^[6-9]\d{9}$/.test(phone.replace(/\s+/g, ''));
}

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePAN(pan) {
  return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
}

// ── SIDEBAR ──
export function initSidebar(activeLink, basePath = './') {
  const links = document.querySelectorAll('#sidebar nav a');
  links.forEach(link => {
    const href = link.getAttribute('href') || '';
    const cleanHref = href.replace(/^(\.\/|\.\.\/)+/, '');
    const cleanActive = activeLink ? activeLink.replace(/^(\.\/|\.\.\/)+/, '') : '';
    
    if (cleanActive && cleanHref === cleanActive) {
      link.classList.add('active');
    } else if (cleanActive) {
      link.classList.remove('active');
    }
  });

  const hamburger = document.getElementById('hamburger-btn');
  const sidebar   = document.getElementById('sidebar');
  const overlay   = document.getElementById('sidebar-overlay');
  const logoutBtn = document.getElementById('logout-btn');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => logout(basePath));
  }

  if (hamburger && sidebar) {
    hamburger.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      if (overlay) overlay.classList.toggle('show');
    });
  }

  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('show');
    });
  }
}

// ── PAGINATION RENDERER ──
export function renderPagination(containerId, currentPage, totalPages, onPageChange) {
  const el = document.getElementById(containerId);
  if (!el) return;

  if (totalPages <= 1) { el.innerHTML = ''; return; }

  let html = '<div class="flex items-center gap-2">';

  // Prev
  html += `<button onclick="(${onPageChange.toString()})(${currentPage - 1})"
    ${currentPage === 1 ? 'disabled' : ''}
    class="btn btn-sm btn-outline" ${currentPage === 1 ? 'style="opacity:.4;cursor:not-allowed"' : ''}>
    ‹ Prev</button>`;

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
      html += `<button onclick="(${onPageChange.toString()})(${i})"
        class="btn btn-sm ${i === currentPage ? 'btn-primary' : 'btn-outline'}">${i}</button>`;
    } else if (Math.abs(i - currentPage) === 2) {
      html += '<span class="text-gray-400">…</span>';
    }
  }

  // Next
  html += `<button onclick="(${onPageChange.toString()})(${currentPage + 1})"
    ${currentPage === totalPages ? 'disabled' : ''}
    class="btn btn-sm btn-outline" ${currentPage === totalPages ? 'style="opacity:.4;cursor:not-allowed"' : ''}>
    Next ›</button>`;

  html += '</div>';
  el.innerHTML = html;
}

// ── LOADING STATE ──
export function setLoading(btnEl, loading = true) {
  if (!btnEl) return;
  if (loading) {
    btnEl._origText = btnEl.innerHTML;
    btnEl.innerHTML = '<span class="spinner" style="width:16px;height:16px;border-width:2px"></span> Loading…';
    btnEl.disabled = true;
  } else {
    btnEl.innerHTML = btnEl._origText || 'Submit';
    btnEl.disabled = false;
  }
}

// ── AUTO-SAVE ──
export function initAutosave(key, dataFn, intervalMs = 30000) {
  const indicator = document.getElementById('autosave-indicator');
  const interval = setInterval(() => {
    try {
      const data = dataFn();
      localStorage.setItem(key, JSON.stringify({ data, savedAt: Date.now() }));
      if (indicator) {
        indicator.className = 'autosave-indicator saving';
        indicator.textContent = '✓ Saved';
        setTimeout(() => {
          indicator.className = 'autosave-indicator';
          indicator.textContent = 'Auto-save on';
        }, 2000);
      }
    } catch (err) {
      console.error('Autosave error:', err);
    }
  }, intervalMs);

  return () => clearInterval(interval);
}

export function getAutosaved(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ── SIDEBAR HTML TEMPLATE ──
export function getSidebarHTML(active = '', basePath = './') {
  checkSession(basePath);

  const navItems = [
    { href: `${basePath}index.html`,          icon: 'home',         label: 'Dashboard'  },
    { href: `${basePath}products.html`,        icon: 'package',      label: 'Products'   },
    { href: `${basePath}invoices/create.html`, icon: 'file-text',    label: 'Invoices'   },
    { href: `${basePath}orders.html`,          icon: 'shopping-cart',label: 'Orders'     },
    { href: `${basePath}customers.html`,       icon: 'users',        label: 'Customers'  },
    { href: `${basePath}reports.html`,         icon: 'bar-chart-2',  label: 'Reports'    },
    { href: `${basePath}offers.html`,          icon: 'tag',          label: 'Offers'     },
    { href: `${basePath}settings.html`,        icon: 'settings',     label: 'Settings'   }
  ];

  const iconSVGs = {
    'home':          '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    'package':       '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
    'file-text':     '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
    'shopping-cart': '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
    'users':         '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    'bar-chart-2':   '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    'tag':           '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
    'settings':      '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>'
  };

  return `
    <div class="logo-area">
      <h1>🌿 VELOCITY CYCLES</h1>
      <p>Inventory Management</p>
    </div>
    <div class="section-label">MAIN MENU</div>
    <nav>
      ${navItems.map(item => `
        <a href="${item.href}" class="${active === item.label ? 'active' : ''}">
          ${iconSVGs[item.icon]}
          <span>${item.label}</span>
        </a>
      `).join('')}
    </nav>
    <div class="sidebar-footer">
      <div>VELOCITY CYCLES IMS v1.0</div>
      <div style="margin-top:4px">© ${new Date().getFullYear()} All rights reserved</div>
    </div>
  `;
}

// ── TOPBAR HTML TEMPLATE ──
export function getTopbarHTML(title = '') {
  return `
    <div style="display:flex;align-items:center;gap:12px">
      <button id="hamburger-btn" class="btn btn-sm btn-outline no-print" style="display:none;padding:6px 8px">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
      <span class="page-title">${title}</span>
    </div>
    <div class="topbar-right">
      <div id="autosave-indicator" class="autosave-indicator" style="display:none">Auto-save on</div>
      <div id="connection-badge" class="connection-badge online">
        <span class="connection-dot"></span> Connected
      </div>
      <div id="logout-btn" style="width:34px;height:34px;border-radius:50%;background:var(--frost-green);display:flex;align-items:center;justify-content:center;font-weight:700;color:var(--dark-green);cursor:pointer" title="Sign Out">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
      </div>
    </div>
  `;
}

// Show hamburger on mobile
const style = document.createElement('style');
style.textContent = '@media(max-width:1024px){#hamburger-btn{display:flex!important}}';
document.head.appendChild(style);

export default { showToast, openModal, closeModal, fmtCurrency, fmtDate, validateGSTIN, validatePhone, initSidebar };

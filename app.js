/* =============================================================================
   Quatre — Répartition automatique de revenus en 4 piliers
   Application autonome : HTML/CSS/JS, stockage local, aucune dépendance.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------------------------------------------------------------------------
     1. Constantes
     ------------------------------------------------------------------------ */
  const STORAGE_KEY = 'quatre.app.v1';
  const PIVOT = 'EUR';

  const CUR_ORDER = ['EUR', 'USD', 'JPY', 'GBP'];
  const CURRENCIES = {
    EUR: { code: 'EUR', symbol: '€', decimals: 2, name: 'Euro' },
    USD: { code: 'USD', symbol: '$', decimals: 2, name: 'Dollar américain' },
    JPY: { code: 'JPY', symbol: '¥', decimals: 0, name: 'Yen japonais' },
    GBP: { code: 'GBP', symbol: '£', decimals: 2, name: 'Livre sterling' }
  };

  const PILLARS = [
    { id: 'dime',           name: 'Dîme',           pct: 10, color: '#a78bfa', icon: 'landmark', hint: '1/10 du revenu' },
    { id: 'charite',        name: 'Charité',        pct: 10, color: '#fb7185', icon: 'heart',    hint: '1/10 du revenu' },
    { id: 'besoins',        name: 'Besoins',        pct: 60, color: '#38bdf8', icon: 'home',     hint: '6/10 du revenu' },
    { id: 'investissement', name: 'Investissement', pct: 20, color: '#34d399', icon: 'trend',    hint: '2/10 du revenu' }
  ];
  const PILLAR_MAP = PILLARS.reduce((acc, p) => (acc[p.id] = p, acc), {});

  const DEFAULT_RATES = { EUR: 1, USD: 1.08, JPY: 168, GBP: 0.85 };

  const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet',
                  'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  const MONTHS_SHORT = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.',
                        'août', 'sept.', 'oct.', 'nov.', 'déc.'];

  const PAGES = ['dashboard', 'revenus', 'depenses', 'historique', 'rapport', 'reglages'];

  /* ---------------------------------------------------------------------------
     2. Icônes (SVG inline, trait fin cohérent)
     ------------------------------------------------------------------------ */
  const ICONS = {
    grid:      '<rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/>',
    in:        '<path d="M17 7 7 17"/><path d="M17 17H7V7"/>',
    out:       '<path d="M7 17 17 7"/><path d="M7 7h10v10"/>',
    calendar:  '<rect x="3" y="4.5" width="18" height="16.5" rx="3"/><path d="M8 2.5v4M16 2.5v4M3 10h18"/>',
    doc:       '<path d="M14 2.5H7.5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V7z"/><path d="M14 2.5V7h4.5"/><path d="M9 13h6M9 17h4"/>',
    settings:  '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    plus:      '<path d="M12 5v14M5 12h14"/>',
    trash:     '<path d="M3.5 6h17M8.5 6V4.2a1.2 1.2 0 0 1 1.2-1.2h4.6a1.2 1.2 0 0 1 1.2 1.2V6"/><path d="M18.8 6l-.9 13.4a2 2 0 0 1-2 1.9H8.1a2 2 0 0 1-2-1.9L5.2 6"/><path d="M10 11v6M14 11v6"/>',
    left:      '<path d="m15 18-6-6 6-6"/>',
    right:     '<path d="m9 18 6-6-6-6"/>',
    download:  '<path d="M21 15v3.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V15"/><path d="m7.5 10.5 4.5 4.5 4.5-4.5"/><path d="M12 15V3"/>',
    upload:    '<path d="M21 15v3.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V15"/><path d="m7.5 8 4.5-4.5L16.5 8"/><path d="M12 3.5V15"/>',
    printer:   '<path d="M6.5 9V3.5h11V9"/><path d="M6.5 18H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-1.5"/><rect x="6.5" y="14" width="11" height="7" rx="1.5"/>',
    check:     '<path d="m20 6-11 11-5-5"/>',
    alert:     '<path d="M12 9.5v4.5M12 17.5h.01"/><path d="M10.3 3.9 1.9 18.1a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
    landmark:  '<path d="m12 2.5 8.5 4.2H3.5z"/><path d="M6.2 9v7.2M10.1 9v7.2M13.9 9v7.2M17.8 9v7.2"/><path d="M3 20.5h18"/>',
    heart:     '<path d="M20.8 4.7a5.5 5.5 0 0 0-7.8 0L12 5.8l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21.3l7.7-7.7 1.1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
    home:      '<path d="m3.2 10 8.8-6.8L20.8 10v9a2 2 0 0 1-2 2H5.2a2 2 0 0 1-2-2z"/><path d="M9.2 21v-6.8h5.6V21"/>',
    trend:     '<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    wallet:    '<path d="M20 11.5V8a2 2 0 0 0-2-2H5.5a2.5 2.5 0 0 1 0-5H19v4"/><path d="M3 5.5v12.5A2.5 2.5 0 0 0 5.5 20.5H19a2 2 0 0 0 2-2V14"/><path d="M21 11.5h-4.2a2.5 2.5 0 0 0 0 5H21z"/>',
    undo:      '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
    x:         '<path d="M18 6 6 18M6 6l12 12"/>',
    refresh:   '<path d="M20.5 12a8.5 8.5 0 1 1-2.5-6"/><path d="M20.5 3.5V9H15"/>',
    save:      '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
    database:  '<ellipse cx="12" cy="5" rx="8.5" ry="3"/><path d="M3.5 5v14c0 1.7 3.8 3 8.5 3s8.5-1.3 8.5-3V5"/><path d="M3.5 12c0 1.7 3.8 3 8.5 3s8.5-1.3 8.5-3"/>',
    info:      '<circle cx="12" cy="12" r="9"/><path d="M12 16.5V11.5M12 7.8h.01"/>',
    sparkles:  '<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
    chart:     '<path d="M3 3v18h18"/><path d="m7 14.5 3-4 3 3 4.5-6"/>',
    filter:    '<path d="M4 5h16M7 12h10M10 19h4"/>',
    arrowUp:   '<path d="M12 19V5"/><path d="m6 11 6-6 6 6"/>',
    arrowDown: '<path d="M12 5v14"/><path d="m6 13 6 6 6-6"/>'
  };

  function icon(name, cls) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" ' +
           'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' +
           (cls ? ' class="' + cls + '"' : '') + '>' + (ICONS[name] || '') + '</svg>';
  }

  /* ---------------------------------------------------------------------------
     3. Utilitaires
     ------------------------------------------------------------------------ */
  const $  = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const pad2 = (n) => (n < 10 ? '0' : '') + n;
  const uid = () => 'q' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
  const round2 = (n) => Math.round(n * 100) / 100;
  const sum = (arr, fn) => arr.reduce((s, x) => s + (fn ? fn(x) : x), 0);

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  const fmtCache = new Map();
  function numberFormat(cur, decimals, sign) {
    const key = cur + '|' + decimals + '|' + (sign ? 1 : 0);
    let f = fmtCache.get(key);
    if (!f) {
      f = new Intl.NumberFormat('fr-FR', {
        style: 'currency', currency: cur, currencyDisplay: 'narrowSymbol',
        minimumFractionDigits: decimals, maximumFractionDigits: decimals,
        signDisplay: sign ? 'always' : 'auto'
      });
      fmtCache.set(key, f);
    }
    return f;
  }

  function fmtMoney(value, cur, opts) {
    opts = opts || {};
    cur = cur || state.settings.primary || 'EUR';
    const meta = CURRENCIES[cur] || CURRENCIES.EUR;
    const decimals = opts.decimals !== undefined ? opts.decimals : meta.decimals;
    const safe = isFinite(value) ? value : 0;
    try {
      return numberFormat(cur, decimals, opts.sign).format(safe);
    } catch (e) {
      return safe.toFixed(decimals) + ' ' + meta.symbol;
    }
  }

  function fmtPlain(value, decimals) {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: decimals === undefined ? 0 : decimals,
      maximumFractionDigits: decimals === undefined ? 0 : decimals
    }).format(isFinite(value) ? value : 0);
  }

  function fmtCompact(value) {
    return new Intl.NumberFormat('fr-FR', { notation: 'compact', maximumFractionDigits: 1 }).format(isFinite(value) ? value : 0);
  }

  function todayISO() {
    const d = new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }
  function nowMonth() { return todayISO().slice(0, 7); }

  function dateToMonth(iso) { return String(iso || '').slice(0, 7); }

  function monthLabel(key, short) {
    const parts = String(key || '').split('-');
    const y = parts[0], m = parseInt(parts[1], 10);
    if (!y || !m) return '';
    const name = short ? MONTHS_SHORT[m - 1] : MONTHS[m - 1];
    return short ? name : name + ' ' + y;
  }

  function dateLabel(iso, withYear) {
    const d = new Date(String(iso) + 'T12:00:00');
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: withYear === false ? undefined : 'numeric'
    });
  }

  function shiftMonth(key, delta) {
    const parts = String(key).split('-');
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1 + delta, 1);
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1);
  }

  function lastMonths(n, endKey) {
    const end = endKey || nowMonth();
    const out = [];
    for (let i = n - 1; i >= 0; i--) out.push(shiftMonth(end, -i));
    return out;
  }

  function pctChange(current, previous) {
    if (!previous) return current ? null : 0;
    return ((current - previous) / Math.abs(previous)) * 100;
  }

  function download(filename, content, mime) {
    const blob = new Blob([content], { type: mime || 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  /* ---------------------------------------------------------------------------
     4. État & persistance
     ------------------------------------------------------------------------ */
  function defaultSettings() {
    return { primary: 'EUR', rates: Object.assign({}, DEFAULT_RATES), ratesUpdated: todayISO(), ratesNote: '' };
  }

  function makeState() {
    return { version: 1, settings: defaultSettings(), incomes: [], expenses: [], seeded: false };
  }

  function normalize(raw) {
    const base = makeState();
    if (!raw || typeof raw !== 'object') return base;
    const settings = defaultSettings();
    if (raw.settings && typeof raw.settings === 'object') {
      if (CURRENCIES[raw.settings.primary]) settings.primary = raw.settings.primary;
      if (raw.settings.rates && typeof raw.settings.rates === 'object') {
        CUR_ORDER.forEach((c) => {
          const v = Number(raw.settings.rates[c]);
          if (c !== PIVOT) settings.rates[c] = v > 0 ? v : DEFAULT_RATES[c];
        });
      }
      if (raw.settings.ratesUpdated) settings.ratesUpdated = String(raw.settings.ratesUpdated);
      if (raw.settings.ratesNote) settings.ratesNote = String(raw.settings.ratesNote).slice(0, 120);
    }
    settings.rates[PIVOT] = 1;

    const cleanTx = (t, kind) => {
      if (!t || typeof t !== 'object') return null;
      const amount = Number(t.amount);
      if (!isFinite(amount) || amount <= 0) return null;
      const currency = CURRENCIES[t.currency] ? t.currency : 'EUR';
      const date = /^\d{4}-\d{2}-\d{2}$/.test(String(t.date)) ? String(t.date) : todayISO();
      const out = {
        id: String(t.id || uid()),
        amount: round2(amount),
        currency: currency,
        base: Number(t.base) > 0 ? Number(t.base) : amount / (currency === PIVOT ? 1 : (Number(settings.rates[currency]) || 1)),
        date: date,
        note: String(t.note || '').slice(0, 160),
        createdAt: Number(t.createdAt) || Date.now()
      };
      if (kind === 'expense') {
        out.category = PILLAR_MAP[t.category] ? t.category : 'besoins';
      }
      if (t.demo) out.demo = true;
      return out;
    };

    const incomes = Array.isArray(raw.incomes) ? raw.incomes.map((t) => cleanTx(t, 'income')).filter(Boolean) : [];
    const expenses = Array.isArray(raw.expenses) ? raw.expenses.map((t) => cleanTx(t, 'expense')).filter(Boolean) : [];

    return { version: 1, settings: settings, incomes: incomes, expenses: expenses, seeded: !!raw.seeded };
  }

  let storageOK = true;

  function loadState() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return normalize(JSON.parse(raw));
    } catch (e) {
      storageOK = false;
      return null;
    }
  }

  function saveState() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      storageOK = true;
    } catch (e) {
      storageOK = false;
      console.warn('Sauvegarde locale impossible', e);
    }
    const mini = $('#mini-balance');
    if (mini) renderMiniBalance();
  }

  let state = loadState() || makeState();
  if (!state.settings) state.settings = defaultSettings();

  const ui = {
    route: 'dashboard',
    reportMonth: nowMonth(),
    historyYear: new Date().getFullYear(),
    expenseFilter: 'all',
    incomeMonth: 'all',
    incomeLimit: 14,
    expenseLimit: 14,
    lastFocus: null,
    lastWidth: 0
  };

  /* ---------------------------------------------------------------------------
     5. Calculs (tout est stocké en base EUR, converti à l'affichage)
     ------------------------------------------------------------------------ */
  function rateOf(cur) {
    if (cur === PIVOT) return 1;
    const r = Number(state.settings.rates[cur]);
    return r > 0 ? r : (DEFAULT_RATES[cur] || 1);
  }
  function toBase(amount, cur) { return amount / rateOf(cur); }
  function baseTo(base, cur) { return base * rateOf(cur); }
  function fmtBase(base, cur, opts) { return fmtMoney(baseTo(base, cur), cur, opts); }

  function num(base, cur, key, opts) {
    opts = opts || {};
    const value = baseTo(base, cur);
    return '<span data-num="' + value + '" data-cur="' + cur + '" data-key="' + escapeHtml(key) + '"' +
      (opts.dec !== undefined ? ' data-dec="' + opts.dec + '"' : '') +
      (opts.sign ? ' data-sign="1"' : '') + '>' +
      fmtMoney(value, cur, { decimals: opts.dec, sign: opts.sign }) + '</span>';
  }

  function monthData(key) {
    const inc = state.incomes.filter((t) => dateToMonth(t.date) === key);
    const exp = state.expenses.filter((t) => dateToMonth(t.date) === key);
    const incomeBase = sum(inc, (t) => t.base);
    const expenseBase = sum(exp, (t) => t.base);
    const alloc = {}, spent = {}, remaining = {};
    PILLARS.forEach((p) => {
      alloc[p.id] = incomeBase * p.pct / 100;
      spent[p.id] = sum(exp.filter((t) => t.category === p.id), (t) => t.base);
      remaining[p.id] = alloc[p.id] - spent[p.id];
    });
    return {
      key: key, incomes: inc, expenses: exp,
      incomeBase: incomeBase, expenseBase: expenseBase, net: incomeBase - expenseBase,
      alloc: alloc, spent: spent, remaining: remaining
    };
  }

  function lifeData() {
    const incomeBase = sum(state.incomes, (t) => t.base);
    const expenseBase = sum(state.expenses, (t) => t.base);
    const alloc = {}, spent = {}, balance = {};
    PILLARS.forEach((p) => {
      alloc[p.id] = incomeBase * p.pct / 100;
      spent[p.id] = sum(state.expenses.filter((t) => t.category === p.id), (t) => t.base);
      balance[p.id] = alloc[p.id] - spent[p.id];
    });
    return {
      incomeBase: incomeBase, expenseBase: expenseBase, balanceBase: incomeBase - expenseBase,
      alloc: alloc, spent: spent, balance: balance
    };
  }

  function rateLabel(cur) {
    if (cur === PIVOT) return 'base';
    return '1 € = ' + fmtPlain(rateOf(cur), 2) + ' ' + cur;
  }

  function deltaPill(pct, invert) {
    if (pct === null || pct === undefined || !isFinite(pct)) {
      return '<span class="pill">—</span>';
    }
    const good = invert ? pct < 0 : pct >= 0;
    const arrow = pct >= 0 ? 'arrowUp' : 'arrowDown';
    return '<span class="pill ' + (good ? 'pill-pos' : 'pill-neg') + '">' + icon(arrow) +
      (pct >= 0 ? '+' : '') + fmtPlain(pct, 1) + ' %</span>';
  }

  function txAll() {
    const inc = state.incomes.map((t) => Object.assign({}, t, { type: 'in' }));
    const exp = state.expenses.map((t) => Object.assign({}, t, { type: 'out' }));
    return inc.concat(exp).sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
  }

  /* ---------------------------------------------------------------------------
     6. Animation des montants
     ------------------------------------------------------------------------ */
  const numberMemory = new Map();

  function animateMoney(el, from, to, cur, opts) {
    opts = opts || {};
    const apply = (v) => { el.textContent = fmtMoney(v, cur, { decimals: opts.dec, sign: opts.sign }); };
    if (el._raf) { cancelAnimationFrame(el._raf); el._raf = null; }
    if (prefersReduced || !isFinite(from) || Math.abs(to - from) < 0.004) { apply(to); return; }
    const dur = opts.duration || 620;
    const t0 = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      apply(from + (to - from) * easeOutCubic(t));
      if (t < 1) el._raf = requestAnimationFrame(tick); else el._raf = null;
    };
    el._raf = requestAnimationFrame(tick);
  }

  function hydrateNumbers(root) {
    $$('[data-num]', root).forEach((el) => {
      const target = Number(el.dataset.num) || 0;
      const cur = el.dataset.cur || state.settings.primary;
      const key = el.dataset.key || ('el' + Array.prototype.indexOf.call(el.parentNode.children, el));
      const dec = el.dataset.dec !== undefined ? Number(el.dataset.dec) : undefined;
      const sign = el.dataset.sign === '1';
      const prev = numberMemory.has(key) ? numberMemory.get(key) : target;
      numberMemory.set(key, target);
      animateMoney(el, prev, target, cur, { dec: dec, sign: sign });
    });
  }

  /* ---------------------------------------------------------------------------
     7. Toasts & modale
     ------------------------------------------------------------------------ */
  function toast(message, opts) {
    opts = opts || {};
    const root = $('#toasts');
    if (!root) return;
    const el = document.createElement('div');
    el.className = 'toast' + (opts.type === 'warn' ? ' is-warn' : '');
    el.innerHTML =
      '<span class="t-ico">' + icon(opts.type === 'warn' ? 'alert' : 'check') + '</span>' +
      '<span class="t-msg">' + message + '</span>' +
      (opts.action ? '<button class="t-act" type="button">' + escapeHtml(opts.action.label) + '</button>' : '') +
      '<button class="t-act t-close" type="button" aria-label="Fermer">' + icon('x') + '</button>';
    root.appendChild(el);
    let closed = false;
    const close = () => {
      if (closed) return; closed = true;
      el.classList.add('is-out');
      setTimeout(() => el.remove(), 240);
    };
    const timer = setTimeout(close, opts.duration || 4200);
    const closeBtn = $('.t-close', el);
    if (closeBtn) closeBtn.addEventListener('click', () => { clearTimeout(timer); close(); });
    if (opts.action) {
      $('.t-act', el).addEventListener('click', () => {
        clearTimeout(timer); close();
        opts.action.onClick();
      });
    }
    while (root.children.length > 3) root.removeChild(root.firstChild);
  }

  function closeModal() {
    const root = $('#modal-root');
    root.classList.remove('is-on');
    root.innerHTML = '';
    document.body.style.overflow = '';
    if (ui.lastFocus && ui.lastFocus.focus) { try { ui.lastFocus.focus(); } catch (e) {} }
  }

  function openModal(config) {
    const root = $('#modal-root');
    ui.lastFocus = document.activeElement;
    root.innerHTML =
      '<div class="modal-backdrop" data-modal-close></div>' +
      '<div class="modal" role="dialog" aria-modal="true" aria-label="' + escapeHtml(config.title) + '">' +
        '<h3>' + escapeHtml(config.title) + '</h3>' +
        '<p>' + config.body + '</p>' +
        '<div class="modal-acts">' +
          '<button class="btn" type="button" data-modal-close>' + escapeHtml(config.cancel || 'Annuler') + '</button>' +
          '<button class="btn ' + (config.danger ? 'btn-danger' : 'btn-primary') + '" type="button" data-modal-ok>' +
            escapeHtml(config.confirm || 'Confirmer') + '</button>' +
        '</div>' +
      '</div>';
    root.classList.add('is-on');
    document.body.style.overflow = 'hidden';
    const ok = $('[data-modal-ok]', root);
    if (ok) {
      ok.focus();
      ok.addEventListener('click', () => { closeModal(); config.onConfirm(); });
    }
  }

  /* ---------------------------------------------------------------------------
     8. Graphiques
     ------------------------------------------------------------------------ */
  const CHART_TIP = '<div class="chart-tooltip" role="status"></div>';

  function renderSpark(el) {
    const months = lastMonths(6);
    const values = months.map((k) => {
      const md = monthData(k);
      return md.net;
    });
    const w = Math.max(120, el.clientWidth || 260), h = 42, pad = 3;
    const max = Math.max.apply(null, values.concat([1]));
    const min = Math.min.apply(null, values.concat([0]));
    const span = (max - min) || 1;
    const pts = values.map((v, i) => {
      const x = values.length > 1 ? pad + (i * (w - pad * 2)) / (values.length - 1) : w / 2;
      const y = h - pad - ((v - min) / span) * (h - pad * 2);
      return [x, y];
    });
    const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    const area = line + ' L' + pts[pts.length - 1][0].toFixed(1) + ' ' + h + ' L' + pts[0][0].toFixed(1) + ' ' + h + ' Z';
    const id = 'sg' + Math.random().toString(36).slice(2, 7);
    el.innerHTML =
      '<svg viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" aria-hidden="true">' +
        '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0%" stop-color="#34d399" stop-opacity=".34"/>' +
          '<stop offset="100%" stop-color="#34d399" stop-opacity="0"/>' +
        '</linearGradient></defs>' +
        '<path d="' + area + '" fill="url(#' + id + ')"/>' +
        '<path d="' + line + '" fill="none" stroke="#34d399" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>' +
        '<circle cx="' + pts[pts.length - 1][0].toFixed(1) + '" cy="' + pts[pts.length - 1][1].toFixed(1) + '" r="2.6" fill="#34d399"/>' +
      '</svg>';
  }

  function renderDonut(el) {
    const life = lifeData();
    const total = sum(PILLARS, (p) => life.alloc[p.id]);
    const c = 2 * Math.PI * 72;
    const gap = total > 0 ? 4 : 0;
    let acc = 0;
    const segs = PILLARS.map((p, i) => {
      const frac = total > 0 ? life.alloc[p.id] / total : p.pct / 100;
      const len = Math.max(frac * c - gap, frac > 0 ? 1 : 0);
      const d = -(acc * c);
      acc += frac;
      return '<circle class="donut-seg" cx="100" cy="100" r="72" fill="none" stroke="' + p.color +
        '" stroke-width="16" stroke-linecap="round" stroke-dasharray="0 ' + c.toFixed(2) + '" ' +
        'stroke-dashoffset="' + d.toFixed(2) + '" data-len="' + len.toFixed(2) + '" data-c="' + c.toFixed(2) + '" ' +
        'style="transition-delay:' + (i * 70) + 'ms;filter:drop-shadow(0 0 6px ' + p.color + '55)"></circle>';
    }).join('');

    el.innerHTML =
      '<svg viewBox="0 0 200 200" aria-hidden="true">' +
        '<circle cx="100" cy="100" r="72" fill="none" stroke="rgba(255,255,255,.055)" stroke-width="16"/>' +
        segs +
      '</svg>' +
      '<div class="donut-center">' +
        '<span>Réparti</span>' +
        '<strong data-num="' + total + '" data-cur="' + state.settings.primary + '" data-key="donut.total">' +
          fmtMoney(total, state.settings.primary) + '</strong>' +
        '<em>' + (state.incomes.length ? state.incomes.length + ' revenu' + (state.incomes.length > 1 ? 's' : '') : 'aucun revenu') + '</em>' +
      '</div>';

    requestAnimationFrame(() => {
      $$('.donut-seg', el).forEach((s) => {
        s.setAttribute('stroke-dasharray', s.dataset.len + ' ' + (Number(s.dataset.c) - Number(s.dataset.len)).toFixed(2));
      });
    });
    hydrateNumbers(el);
  }

  function renderEvolution(el) {
    const months = lastMonths(8);
    const rows = months.map((k) => {
      const md = monthData(k);
      return { key: k, income: baseTo(md.incomeBase, state.settings.primary), expense: baseTo(md.expenseBase, state.settings.primary) };
    });
    const w = Math.max(320, el.clientWidth || 560), h = 248;
    const pad = { l: 48, r: 14, t: 16, b: 30 };
    const max = Math.max(1, Math.max.apply(null, rows.map((r) => Math.max(r.income, r.expense)))) * 1.12;
    const innerW = w - pad.l - pad.r, innerH = h - pad.t - pad.b;
    const step = rows.length > 1 ? innerW / (rows.length - 1) : innerW;

    const x = (i) => pad.l + i * step;
    const y = (v) => pad.t + innerH - (v / max) * innerH;

    const linePath = (key) => rows.map((r, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(r[key]).toFixed(1)).join(' ');
    const areaPath = (key) => linePath(key) + ' L' + x(rows.length - 1).toFixed(1) + ' ' + (pad.t + innerH) +
      ' L' + x(0).toFixed(1) + ' ' + (pad.t + innerH) + ' Z';

    let grid = '';
    const ticks = 4;
    for (let i = 0; i <= ticks; i++) {
      const v = (max / ticks) * i;
      const gy = y(v);
      grid += '<line class="chart-grid-line" x1="' + pad.l + '" x2="' + (w - pad.r) + '" y1="' + gy.toFixed(1) + '" y2="' + gy.toFixed(1) + '"/>';
      grid += '<text class="chart-axis" x="' + (pad.l - 10) + '" y="' + (gy + 3.5).toFixed(1) + '" text-anchor="end">' + fmtCompact(v) + '</text>';
    }

    const labels = rows.map((r, i) => {
      const show = (w >= 480 && rows.length <= 8) || i % 2 === 0 || i === rows.length - 1;
      return show ? '<text class="chart-axis" x="' + x(i).toFixed(1) + '" y="' + (h - 8) + '" text-anchor="middle">' +
        escapeHtml(monthLabel(r.key, true).replace('.', '')) + '</text>' : '';
    }).join('');

    const dots = (key, color) => rows.map((r, i) =>
      '<circle class="evo-dot evo-dot-' + key + '" cx="' + x(i).toFixed(1) + '" cy="' + y(r[key]).toFixed(1) +
      '" r="0" fill="' + color + '" stroke="#0b0d12" stroke-width="2"/>').join('');

    const hotspots = rows.map((r, i) => {
      const bw = step;
      return '<rect x="' + (x(i) - bw / 2).toFixed(1) + '" y="' + pad.t + '" width="' + bw.toFixed(1) + '" height="' + innerH +
        '" fill="transparent" data-i="' + i + '"></rect>';
    }).join('');

    el.innerHTML =
      '<svg viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="Évolution des revenus et dépenses">' +
        '<defs>' +
          '<linearGradient id="evoIn" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0%" stop-color="#38bdf8" stop-opacity=".28"/>' +
            '<stop offset="100%" stop-color="#38bdf8" stop-opacity="0"/>' +
          '</linearGradient>' +
          '<linearGradient id="evoOut" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0%" stop-color="#fb7185" stop-opacity=".16"/>' +
            '<stop offset="100%" stop-color="#fb7185" stop-opacity="0"/>' +
          '</linearGradient>' +
        '</defs>' +
        grid +
        '<path d="' + areaPath('income') + '" fill="url(#evoIn)"/>' +
        '<path d="' + areaPath('expense') + '" fill="url(#evoOut)"/>' +
        '<path d="' + linePath('income') + '" fill="none" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 4px 10px rgba(56,189,248,.35))"/>' +
        '<path d="' + linePath('expense') + '" fill="none" stroke="#fb7185" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="4 4" opacity=".85"/>' +
        dots('income', '#38bdf8') + dots('expense', '#fb7185') +
        '<line class="evo-guide" x1="0" x2="0" y1="' + pad.t + '" y2="' + (pad.t + innerH) + '" stroke="rgba(255,255,255,.2)" stroke-width="1" stroke-dasharray="3 3" opacity="0"/>' +
        labels +
        hotspots +
      '</svg>' + CHART_TIP;

    const svg = $('svg', el);
    const tip = $('.chart-tooltip', el);
    const guide = $('.evo-guide', el);
    const inDots = $$('.evo-dot-income', el);
    const outDots = $$('.evo-dot-expense', el);
    let active = -1;

    const show = (i, clientX) => {
      if (i < 0 || i >= rows.length) return;
      const r = rows[i];
      const prevRow = i > 0 ? rows[i - 1] : null;
      const delta = prevRow ? pctChange(r.income, prevRow.income) : null;
      if (active !== i) {
        active = i;
        guide.setAttribute('x1', x(i).toFixed(1)); guide.setAttribute('x2', x(i).toFixed(1));
        guide.setAttribute('opacity', '1');
        inDots.forEach((d, k) => { d.setAttribute('r', k === i ? '4.5' : '3.4'); d.setAttribute('opacity', k === i ? '1' : '.45'); });
        outDots.forEach((d, k) => { d.setAttribute('r', k === i ? '4' : '3.2'); d.setAttribute('opacity', k === i ? '1' : '.4'); });
      }
      tip.innerHTML =
        '<div class="tt-title">' + escapeHtml(monthLabel(r.key)) + '</div>' +
        '<div class="tt-row"><span>Revenus</span><b>' + fmtMoney(r.income, state.settings.primary) + '</b></div>' +
        '<div class="tt-row"><span>Dépenses</span><b>' + fmtMoney(r.expense, state.settings.primary) + '</b></div>' +
        '<div class="tt-row"><span>Solde</span><b>' + fmtMoney(r.income - r.expense, state.settings.primary) + '</b></div>' +
        (delta !== null ? '<div class="tt-row"><span>vs mois -1</span><b>' + (delta >= 0 ? '+' : '') + fmtPlain(delta, 1) + ' %</b></div>' : '');
      tip.style.left = clamp(x(i), 70, w - 70) + 'px';
      tip.style.top = Math.max(26, Math.min(y(r.income), y(r.expense))) + 'px';
      tip.classList.add('is-on');
    };

    const hide = () => {
      active = -1;
      tip.classList.remove('is-on');
      if (guide) guide.setAttribute('opacity', '0');
      inDots.concat(outDots).forEach((d) => { d.setAttribute('r', '0'); });
    };

    svg.addEventListener('pointermove', (e) => {
      const rect = svg.getBoundingClientRect();
      const px = (e.clientX - rect.left) * (w / rect.width);
      const i = clamp(Math.round((px - pad.l) / step), 0, rows.length - 1);
      show(i, e.clientX);
    });
    svg.addEventListener('pointerleave', hide);
    hydrateNumbers(el);
  }

  function renderMonthlyBars(el) {
    const year = ui.historyYear;
    const keyOf = (m) => year + '-' + pad2(m + 1);
    const rows = [];
    for (let m = 0; m < 12; m++) {
      const k = keyOf(m);
      const md = monthData(k);
      rows.push({ key: k, income: baseTo(md.incomeBase, state.settings.primary), expense: baseTo(md.expenseBase, state.settings.primary) });
    }
    const max = Math.max(1, Math.max.apply(null, rows.map((r) => Math.max(r.income, r.expense))));
    const current = nowMonth();
    el.innerHTML = '<div class="bars">' + rows.map((r) => {
      const ih = r.income > 0 ? Math.max(3, (r.income / max) * 100) : 0;
      const eh = r.expense > 0 ? Math.max(3, (r.expense / max) * 100) : 0;
      return '<div class="bar-group' + (r.key === current ? ' is-current' : '') + '">' +
        '<div class="bar-pair">' +
          '<i class="bar" style="--c:#38bdf8;height:' + ih + '%" title="Revenus ' + escapeHtml(monthLabel(r.key)) + ' : ' + escapeHtml(fmtMoney(r.income, state.settings.primary)) + '"></i>' +
          '<i class="bar" style="--c:#fb7185;height:' + eh + '%" title="Dépenses ' + escapeHtml(monthLabel(r.key)) + ' : ' + escapeHtml(fmtMoney(r.expense, state.settings.primary)) + '"></i>' +
        '</div>' +
        '<span class="bar-label">' + escapeHtml(monthLabel(r.key, true).replace('.', '')) + '</span>' +
      '</div>';
    }).join('') + '</div>';
  }

  function mountCharts(root) {
    const spark = $('[data-chart="spark"]', root);
    if (spark) renderSpark(spark);
    const donut = $('[data-chart="donut"]', root);
    if (donut) renderDonut(donut);
    const evo = $('[data-chart="evolution"]', root);
    if (evo) renderEvolution(evo);
    const bars = $('[data-chart="monthly-bars"]', root);
    if (bars) renderMonthlyBars(bars);
  }

  if (window.ResizeObserver) {
    let t = null;
    new ResizeObserver(() => {
      if (ui.route === 'rapport' || ui.route === 'reglages') return;
      const view = $('#view');
      if (!view) return;
      const w = view.clientWidth;
      if (Math.abs(w - ui.lastWidth) < 3) return;
      ui.lastWidth = w;
      clearTimeout(t);
      t = setTimeout(() => { if (!document.body.classList.contains('printing')) mountCharts(view); }, 180);
    }).observe(document.documentElement);
  }

  /* ---------------------------------------------------------------------------
     9. Fragments d'interface
     ------------------------------------------------------------------------ */
  function pageHead(opts) {
    return '<header class="page-head">' +
      '<div>' +
        (opts.eyebrow ? '<div class="eyebrow">' + (opts.live ? '<span class="pulse"></span>' : '') + escapeHtml(opts.eyebrow) + '</div>' : '') +
        '<h1 class="page-title">' + escapeHtml(opts.title) + '</h1>' +
        (opts.sub ? '<p class="page-sub">' + opts.sub + '</p>' : '') +
      '</div>' +
      (opts.actions ? '<div class="page-actions">' + opts.actions + '</div>' : '') +
    '</header>';
  }

  function currencyOptions(selected) {
    return CUR_ORDER.map((c) =>
      '<option value="' + c + '"' + (c === selected ? ' selected' : '') + '>' +
      c + ' · ' + CURRENCIES[c].symbol + '</option>').join('');
  }

  function emptyState(iconName, title, text, action) {
    return '<div class="empty">' +
      '<span class="empty-ico">' + icon(iconName) + '</span>' +
      '<strong>' + escapeHtml(title) + '</strong>' +
      '<p>' + escapeHtml(text) + '</p>' +
      (action || '') +
    '</div>';
  }

  function txRow(t) {
    const isIn = t.type === 'in';
    const p = isIn ? null : (PILLAR_MAP[t.category] || PILLARS[2]);
    const color = isIn ? '#34d399' : p.color;
    const primary = state.settings.primary;
    const title = isIn ? 'Revenu' : p.name;
    const note = t.note ? t.note : (isIn ? 'réparti 10 / 10 / 60 / 20' : 'dépense');
    const converted = t.currency !== primary && t.type === 'in'
      ? '<div class="tx-sub">' + fmtBase(t.base, primary) + '</div>'
      : '';
    return '<div class="tx" style="--pc:' + color + '">' +
      '<span class="tx-ico">' + icon(isIn ? 'in' : 'out') + '</span>' +
      '<div class="tx-main">' +
        '<div class="tx-title">' + escapeHtml(title) +
          (t.demo ? '<span class="demo-mark" title="Donnée d\'exemple"></span>' : '') +
        '</div>' +
        '<div class="tx-note">' + escapeHtml(note) + '</div>' +
      '</div>' +
      '<div class="tx-meta">' +
        '<div class="tx-amt" style="color:' + (isIn ? '#8cf0c8' : '#ffc2cb') + '">' +
          (isIn ? '+' : '−') + fmtMoney(t.amount, t.currency) + '</div>' +
        '<div class="tx-sub">' + dateLabel(t.date, false) + '</div>' +
        converted +
      '</div>' +
      '<div class="tx-del"><button type="button" data-action="del" data-type="' + (isIn ? 'in' : 'out') +
        '" data-id="' + escapeHtml(t.id) + '" aria-label="Supprimer">' + icon('trash') + '</button></div>' +
    '</div>';
  }

  function txGrouped(items, type, limit) {
    const shown = items.slice(0, limit);
    let html = '', lastMonth = null;
    shown.forEach((t) => {
      const m = dateToMonth(t.date);
      if (m !== lastMonth) {
        html += '<div class="tx-group">' + escapeHtml(monthLabel(m)) + '</div>';
        lastMonth = m;
      }
      html += txRow(Object.assign({}, t, { type: type }));
    });
    return html;
  }

  function showMoreBtn(kind, total, limit) {
    if (total <= limit) return '';
    return '<div style="display:flex;justify-content:center;padding:14px 0 2px">' +
      '<button class="btn btn-sm" type="button" data-action="more-' + kind + '">Afficher ' +
      Math.min(20, total - limit) + ' opérations de plus</button></div>';
  }

  function pillarCard(p) {
    const life = lifeData();
    const primary = state.settings.primary;
    const alloc = life.alloc[p.id];
    const spent = life.spent[p.id];
    const bal = life.balance[p.id];
    const ratio = alloc > 0 ? clamp((spent / alloc) * 100, 0, 100) : 0;
    const others = CUR_ORDER.filter((c) => c !== primary);
    return '<article class="card pillar" style="--pc:' + p.color + '">' +
      '<div class="pillar-top">' +
        '<span class="pillar-ico">' + icon(p.icon) + '</span>' +
        '<span class="pillar-pct">' + p.pct + ' %</span>' +
      '</div>' +
      '<div class="pillar-name">' + p.name + '</div>' +
      '<div class="pillar-amount">' +
        num(bal, primary, 'pillar.bal.' + p.id) +
      '</div>' +
      '<div class="pillar-bar"><i style="width:' + ratio.toFixed(1) + '%"></i></div>' +
      '<div class="pillar-foot"><span>' + fmtPlain(ratio, 0) + ' % consommé</span>' +
        '<span>' + fmtMoney(baseTo(spent, primary), primary, { decimals: 0 }) + '</span></div>' +
      '<div class="pillar-cur">' +
        others.map((c) => '<span>' + c + ' <b>' + fmtPlain(baseTo(bal, c), CURRENCIES[c].decimals) + '</b></span>').join('') +
      '</div>' +
    '</article>';
  }

  /* ---------------------------------------------------------------------------
     10. Vue d'ensemble
     ------------------------------------------------------------------------ */
  function dashboardView() {
    const cur = state.settings.primary;
    const life = lifeData();
    const key = nowMonth();
    const md = monthData(key);
    const prev = monthData(shiftMonth(key, -1));
    const growth = pctChange(md.incomeBase, prev.incomeBase);
    const savingsRate = md.incomeBase > 0 ? (md.net / md.incomeBase) * 100 : 0;
    const recent = txAll().slice(0, 6);
    const demoLeft = state.incomes.some((t) => t.demo) || state.expenses.some((t) => t.demo);
    const totalAlloc = sum(PILLARS, (p) => life.alloc[p.id]);

    const banner = demoLeft ? '<div class="demo-banner">' +
      '<span class="demo-dot"></span>' +
      '<span>Vous explorez des <b>données d\'exemple</b> — ajoutez vos propres revenus ou repartez de zéro.</span>' +
      '<button class="btn btn-sm" type="button" data-action="clear-demo">' + icon('trash') + ' Supprimer les exemples</button>' +
    '</div>' : '';

    const hero =
      '<section class="card hero">' +
        '<div class="hero-grid">' +
          '<div>' +
            '<div class="hero-label">' + icon('wallet') + ' Solde total disponible</div>' +
            '<div class="hero-amount">' + num(life.balanceBase, cur, 'hero.balance') + '</div>' +
            '<div class="hero-meta">' +
              (md.incomeBase > 0 || prev.incomeBase > 0
                ? deltaPill(growth)
                : '<span class="pill">' + icon('sparkles') + ' prêt à démarrer</span>') +
              (md.incomeBase > 0
                ? '<span class="hero-note">revenus <b>' + fmtMoney(baseTo(md.incomeBase, cur), cur, { decimals: 0 }) + '</b> ce mois-ci</span>'
                : '<span class="hero-note">aucun revenu enregistré ce mois-ci</span>') +
            '</div>' +
            '<div class="hero-meta hero-acts" style="margin-top:20px">' +
              '<button class="btn btn-primary" type="button" data-action="goto" data-route="revenus">' +
                icon('plus') + ' Enregistrer un revenu</button>' +
              '<button class="btn" type="button" data-action="goto" data-route="depenses">' +
                icon('out') + ' Dépense</button>' +
            '</div>' +
          '</div>' +
          '<div class="currency-stack">' +
            CUR_ORDER.map((c) =>
              '<div class="currency-row">' +
                '<span class="cur-code"><span class="cur-sym">' + CURRENCIES[c].symbol + '</span>' + c +
                  (c === cur ? '<span class="cur-tag">principale</span>' : '') + '</span>' +
                '<span class="cur-val">' + num(life.balanceBase, c, 'hero.cur.' + c) + '</span>' +
              '</div>').join('') +
          '</div>' +
        '</div>' +
      '</section>';

    const monthCard =
      '<section class="card">' +
        '<div class="card-head">' +
          '<div><div class="card-title">Ce mois-ci</div>' +
          '<div class="card-sub" style="text-transform:capitalize">' + monthLabel(key) + '</div></div>' +
          '<button class="chip" type="button" data-action="goto" data-route="historique">' + icon('calendar') + ' Historique</button>' +
        '</div>' +
        '<div class="month-sum">' +
          '<div class="month-kpis">' +
            '<div class="kpi-mini"><span>Revenus</span><strong>' + num(md.incomeBase, cur, 'm.income') + '</strong></div>' +
            '<div class="kpi-mini"><span>Dépenses</span><strong>' + num(md.expenseBase, cur, 'm.expense') + '</strong></div>' +
          '</div>' +
          '<div class="month-net' + (md.net < 0 ? ' is-neg' : '') + '">' +
            '<span>Solde du mois</span><strong>' + num(md.net, cur, 'm.net') + '</strong>' +
          '</div>' +
          '<div class="month-kpis">' +
            '<div class="kpi-mini"><span>Entrées</span><strong style="font-size:13px;color:var(--text-2)">' +
              md.incomes.length + ' revenu' + (md.incomes.length > 1 ? 's' : '') + '</strong></div>' +
            '<div class="kpi-mini"><span>Épargne</span><strong style="font-size:13px;color:var(--text-2)">' +
              fmtPlain(savingsRate, 0) + ' %</strong></div>' +
          '</div>' +
          '<div class="spark" data-chart="spark" aria-hidden="true"></div>' +
        '</div>' +
      '</section>';

    const pillars =
      '<div class="grid pillars">' + PILLARS.map(pillarCard).join('') + '</div>';

    const donut =
      '<section class="card">' +
        '<div class="card-head">' +
          '<div><div class="card-title">Répartition des piliers</div>' +
          '<div class="card-sub">cumul depuis le début</div></div>' +
          '<span class="pill pill-brand">10 · 10 · 60 · 20</span>' +
        '</div>' +
        '<div class="donut-wrap">' +
          '<div class="donut" data-chart="donut" role="img" aria-label="Répartition par pilier"></div>' +
          '<div class="donut-legend">' +
            PILLARS.map((p) => {
              const share = totalAlloc > 0 ? (life.alloc[p.id] / totalAlloc) * 100 : p.pct;
              return '<div class="dl-row" style="--pc:' + p.color + '">' +
                '<span class="dl-dot"></span>' +
                '<span class="dl-name">' + p.name + '</span>' +
                '<span class="dl-pct">' + fmtPlain(share, 0) + ' %</span>' +
                '<span class="dl-val">' + num(life.alloc[p.id], cur, 'donut.' + p.id) + '</span>' +
              '</div>';
            }).join('') +
          '</div>' +
        '</div>' +
      '</section>';

    const evolution =
      '<section class="card">' +
        '<div class="card-head">' +
          '<div><div class="card-title">Évolution mensuelle</div>' +
          '<div class="card-sub">8 derniers mois · ' + cur + '</div></div>' +
          '<div class="chart-legend">' +
            '<span class="legend-item" style="--c:#38bdf8"><i class="legend-swatch"></i>Revenus</span>' +
            '<span class="legend-item" style="--c:#fb7185"><i class="legend-swatch"></i>Dépenses</span>' +
          '</div>' +
        '</div>' +
        '<div class="chart-wrap" data-chart="evolution"></div>' +
      '</section>';

    const activity =
      '<section class="card">' +
        '<div class="card-head">' +
          '<div><div class="card-title">Activité récente</div>' +
          '<div class="card-sub">' + state.incomes.length + ' revenus · ' + state.expenses.length + ' dépenses</div></div>' +
          '<div class="card-tools">' +
            '<button class="btn btn-sm" type="button" data-action="goto" data-route="revenus">Revenus</button>' +
            '<button class="btn btn-sm" type="button" data-action="goto" data-route="depenses">Dépenses</button>' +
          '</div>' +
        '</div>' +
        (recent.length
          ? '<div class="tx-list">' + recent.map(txRow).join('') + '</div>'
          : emptyState('sparkles', 'Aucune opération', 'Commencez par enregistrer un revenu : la répartition s\'applique automatiquement.',
              '<button class="btn btn-sm btn-primary" type="button" data-action="goto" data-route="revenus" style="margin-top:8px">' + icon('plus') + ' Nouveau revenu</button>')) +
      '</section>';

    const consumption =
      '<section class="card">' +
        '<div class="card-head">' +
          '<div><div class="card-title">Consommation par pilier</div>' +
          '<div class="card-sub">dépensé / alloué depuis le début</div></div>' +
        '</div>' +
        PILLARS.map((p) => {
          const alloc = life.alloc[p.id], spent = life.spent[p.id];
          const r = alloc > 0 ? clamp(spent / alloc * 100, 0, 100) : 0;
          return '<div style="margin-bottom:14px">' +
            '<div style="display:flex;align-items:center;justify-content:space-between;font-size:12px;margin-bottom:6px">' +
              '<span style="color:var(--text-2)">' + p.name + '</span>' +
              '<span style="color:var(--faint);font-variant-numeric:tabular-nums">' +
                fmtMoney(baseTo(spent, cur), cur, { decimals: 0 }) + ' / ' +
                fmtMoney(baseTo(alloc, cur), cur, { decimals: 0 }) + '</span>' +
            '</div>' +
            '<div class="pillar-bar" style="margin-top:0"><i style="width:' + r.toFixed(1) + '%;background:' + p.color + '"></i></div>' +
          '</div>';
        }).join('') +
        '<div class="hero-meta" style="margin-top:18px;padding-top:16px;border-top:1px solid var(--line)">' +
          '<span class="hero-note">Taux d\'épargne global</span>' +
          '<span class="pill ' + (life.incomeBase > 0 && life.balanceBase > 0 ? 'pill-pos' : '') + '">' +
            (life.incomeBase > 0 ? fmtPlain((life.balanceBase / life.incomeBase) * 100, 0) + ' %' : '—') +
          '</span>' +
        '</div>' +
      '</section>';

    return banner +
      pageHead({
        eyebrow: 'Tableau de bord',
        live: true,
        title: 'Vue d\'ensemble',
        sub: 'Vos revenus sont répartis automatiquement selon vos 4 piliers — ' +
             new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) + '.',
        actions: '<button class="btn" type="button" data-action="goto" data-route="rapport">' + icon('doc') + ' Rapport mensuel</button>' +
                 '<button class="btn btn-primary" type="button" data-action="goto" data-route="revenus">' + icon('plus') + ' Nouveau revenu</button>'
      }) +
      '<div class="grid dash-top">' + hero + monthCard + '</div>' +
      pillars +
      '<div class="grid dash-charts">' + donut + evolution + '</div>' +
      '<div class="grid dash-bottom">' + activity + consumption + '</div>';
  }

  /* ---------------------------------------------------------------------------
     11. Revenus
     ------------------------------------------------------------------------ */
  function incomeView() {
    const cur = state.settings.primary;
    const months = Array.from(new Set(state.incomes.map((t) => dateToMonth(t.date)))).sort().reverse();
    if (ui.incomeMonth !== 'all' && months.indexOf(ui.incomeMonth) === -1) ui.incomeMonth = 'all';
    const filtered = state.incomes
      .filter((t) => ui.incomeMonth === 'all' || dateToMonth(t.date) === ui.incomeMonth)
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : (b.createdAt || 0) - (a.createdAt || 0)));
    const totalBase = sum(filtered, (t) => t.base);

    const form =
      '<form class="card form-card" id="income-form" autocomplete="off" novalidate>' +
        '<div class="card-head">' +
          '<div><div class="card-title">Nouveau revenu</div>' +
          '<div class="card-sub">répartition instantanée</div></div>' +
          '<span class="pill pill-brand">' + icon('sparkles') + ' 10 · 10 · 60 · 20</span>' +
        '</div>' +
        '<div class="form">' +
          '<div class="field">' +
            '<label for="inc-amount">Montant reçu</label>' +
            '<div class="amount-field">' +
              '<input class="input" id="inc-amount" name="amount" type="text" inputmode="decimal" ' +
                'placeholder="0,00" data-role="income-amount" aria-label="Montant du revenu">' +
              '<select class="select cur-select" name="currency" data-role="income-currency" aria-label="Devise du revenu">' +
                currencyOptions(cur) + '</select>' +
            '</div>' +
            '<span class="field-hint" id="inc-converted">Saisissez le montant dans la devise reçue.</span>' +
          '</div>' +
          '<div class="form-row">' +
            '<div class="field"><label for="inc-date">Date</label>' +
              '<input class="input" id="inc-date" name="date" type="date" value="' + todayISO() + '"></div>' +
            '<div class="field"><label for="inc-note">Note</label>' +
              '<input class="input" id="inc-note" name="note" type="text" maxlength="160" placeholder="Client, mission…"></div>' +
          '</div>' +
          '<div class="split-preview">' +
            '<div class="split-preview-head"><span>Répartition automatique</span><em id="inc-preview-total">—</em></div>' +
            '<div class="split-rows">' +
              PILLARS.map((p) =>
                '<div class="split-row" style="--pc:' + p.color + '">' +
                  '<span class="dl-dot"></span>' +
                  '<span class="sr-name">' + p.name + '</span>' +
                  '<span class="sr-pct">' + p.pct + ' %</span>' +
                  '<span class="sr-val" data-preview="' + p.id + '">—</span>' +
                '</div>').join('') +
            '</div>' +
          '</div>' +
          '<div class="form-actions">' +
            '<button class="btn btn-primary" type="submit">' + icon('check') + ' Enregistrer & répartir</button>' +
          '</div>' +
          '<span class="field-hint">Le solde de chaque pilier est mis à jour immédiatement.</span>' +
        '</div>' +
      '</form>';

    const list =
      '<section class="card">' +
        '<div class="card-head">' +
          '<div><div class="card-title">Historique des revenus</div>' +
          '<div class="card-sub">' + filtered.length + ' entrée' + (filtered.length > 1 ? 's' : '') + ' · total ' +
            fmtMoney(baseTo(totalBase, cur), cur, { decimals: 0 }) + '</div></div>' +
          '<select class="select" style="width:auto;height:34px;font-size:12px" data-role="income-filter" aria-label="Filtrer par mois">' +
            '<option value="all"' + (ui.incomeMonth === 'all' ? ' selected' : '') + '>Tous les mois</option>' +
            months.map((m) => '<option value="' + m + '"' + (ui.incomeMonth === m ? ' selected' : '') + '>' +
              escapeHtml(monthLabel(m)) + '</option>').join('') +
          '</select>' +
        '</div>' +
        (filtered.length
          ? '<div class="tx-list">' + txGrouped(filtered, 'in', ui.incomeLimit) + '</div>' +
            showMoreBtn('income', filtered.length, ui.incomeLimit)
          : emptyState('in', 'Aucun revenu', 'Chaque revenu enregistré est immédiatement réparti dans vos 4 piliers.')) +
      '</section>';

    return pageHead({
      eyebrow: 'Entrées',
      title: 'Revenus',
      sub: 'Enregistrez une entrée : la règle des 4 piliers s\'applique sans calcul.',
      actions: '<button class="btn" type="button" data-action="export-csv">' + icon('download') + ' Exporter CSV</button>'
    }) +
    '<div class="split">' + form + list + '</div>';
  }

  /* ---------------------------------------------------------------------------
     12. Dépenses
     ------------------------------------------------------------------------ */
  function expenseView() {
    const cur = state.settings.primary;
    const life = lifeData();

    const balGrid = '<div class="bal-grid">' + PILLARS.map((p) => {
      const bal = life.balance[p.id];
      const alloc = life.alloc[p.id];
      const ratio = alloc > 0 ? clamp((life.spent[p.id] / alloc) * 100, 0, 100) : 0;
      return '<div class="bal-card" style="--pc:' + p.color + '">' +
        '<div class="bc-top"><span class="pillar-ico">' + icon(p.icon) + '</span>' +
          '<span class="pillar-pct">' + fmtPlain(ratio, 0) + ' %</span></div>' +
        '<div class="bc-name">' + p.name + '</div>' +
        '<div class="bc-val" style="color:' + (bal < 0 ? '#ffb0bb' : 'var(--text)') + '">' +
          num(bal, cur, 'exp.bal.' + p.id) + '</div>' +
        '<div class="bc-sub">sur ' + fmtMoney(baseTo(alloc, cur), cur, { decimals: 0 }) + ' alloués</div>' +
      '</div>';
    }).join('') + '</div>';

    const options = PILLARS.map((p) =>
      '<button class="seg-opt' + (p.id === 'besoins' ? ' is-on' : '') + '" type="button" style="--pc:' + p.color + '" ' +
        'data-action="pick-category" data-cat="' + p.id + '" aria-pressed="' + (p.id === 'besoins') + '">' +
        icon(p.icon) + '<span>' + p.name + '</span></button>').join('');

    const form =
      '<form class="card form-card" id="expense-form" autocomplete="off" novalidate>' +
        '<div class="card-head">' +
          '<div><div class="card-title">Nouvelle dépense</div>' +
          '<div class="card-sub">imputée à un pilier</div></div>' +
          '<span class="pill">' + icon('out') + ' sortie</span>' +
        '</div>' +
        '<div class="form">' +
          '<div class="field"><span class="label">Pilier</span>' +
            '<div class="seg" role="group" aria-label="Pilier de la dépense">' + options + '</div>' +
            '<input type="hidden" name="category" value="besoins" id="exp-category">' +
          '</div>' +
          '<div class="field">' +
            '<label for="exp-amount">Montant</label>' +
            '<div class="amount-field">' +
              '<input class="input" id="exp-amount" name="amount" type="text" inputmode="decimal" ' +
                'placeholder="0,00" data-role="expense-amount" aria-label="Montant de la dépense">' +
              '<select class="select cur-select" name="currency" data-role="expense-currency" aria-label="Devise de la dépense">' +
                currencyOptions(cur) + '</select>' +
            '</div>' +
          '</div>' +
          '<div class="form-row">' +
            '<div class="field"><label for="exp-date">Date</label>' +
              '<input class="input" id="exp-date" name="date" type="date" value="' + todayISO() + '"></div>' +
            '<div class="field"><label for="exp-note">Note</label>' +
              '<input class="input" id="exp-note" name="note" type="text" maxlength="160" placeholder="Loyer, courses…"></div>' +
          '</div>' +
          '<div class="split-preview">' +
            '<div class="split-preview-head"><span>Solde du pilier</span><em id="exp-pillar-label">Besoins</em></div>' +
            '<div class="split-rows">' +
              '<div class="split-row" style="--pc:#38bdf8"><span class="dl-dot" id="exp-dot"></span>' +
                '<span class="sr-name">Disponible</span>' +
                '<span class="sr-val" id="exp-before">—</span></div>' +
              '<div class="split-row"><span class="sr-name" style="padding-left:14px;color:var(--faint)">Après dépense</span>' +
                '<span class="sr-val" id="exp-after">—</span></div>' +
            '</div>' +
          '</div>' +
          '<div id="exp-warning"></div>' +
          '<div class="form-actions">' +
            '<button class="btn btn-primary" type="submit">' + icon('check') + ' Enregistrer la dépense</button>' +
          '</div>' +
        '</div>' +
      '</form>';

    const filtered = state.expenses
      .filter((t) => ui.expenseFilter === 'all' || t.category === ui.expenseFilter)
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : (b.createdAt || 0) - (a.createdAt || 0)));
    const totalBase = sum(filtered, (t) => t.base);

    const chips = '<div class="card-tools" style="flex-wrap:wrap;margin-bottom:12px">' +
      '<button class="chip' + (ui.expenseFilter === 'all' ? ' is-on' : '') + '" type="button" data-action="filter-expense" data-cat="all">Toutes</button>' +
      PILLARS.map((p) => '<button class="chip' + (ui.expenseFilter === p.id ? ' is-on' : '') + '" type="button" ' +
        'data-action="filter-expense" data-cat="' + p.id + '" style="--pc:' + p.color + '">' +
        '<span style="width:6px;height:6px;border-radius:50%;background:' + p.color + '"></span>' + p.name + '</button>').join('') +
    '</div>';

    const list =
      '<section class="card">' +
        '<div class="card-head">' +
          '<div><div class="card-title">Sorties</div>' +
          '<div class="card-sub">' + filtered.length + ' dépense' + (filtered.length > 1 ? 's' : '') + ' · total ' +
            fmtMoney(baseTo(totalBase, cur), cur, { decimals: 0 }) + '</div></div>' +
        '</div>' +
        chips +
        (filtered.length
          ? '<div class="tx-list' + (filtered.length > 8 ? ' tx-list--compact' : '') + '">' +
              txGrouped(filtered, 'out', ui.expenseLimit) + '</div>' +
            showMoreBtn('expense', filtered.length, ui.expenseLimit)
          : emptyState('out', 'Aucune dépense', 'Les dépenses réduisent le solde du pilier choisi en temps réel.')) +
      '</section>';

    return pageHead({
      eyebrow: 'Sorties',
      title: 'Dépenses',
      sub: 'Chaque dépense est imputée à un pilier : les soldes se mettent à jour instantanément.',
      actions: '<button class="btn" type="button" data-action="export-csv">' + icon('download') + ' Exporter CSV</button>'
    }) +
    balGrid +
    '<div class="split split--wide">' + form + list + '</div>';
  }

  /* ---------------------------------------------------------------------------
     13. Historique
     ------------------------------------------------------------------------ */
  function availableYears() {
    const years = new Set([new Date().getFullYear()]);
    state.incomes.concat(state.expenses).forEach((t) => {
      const y = parseInt(String(t.date).slice(0, 4), 10);
      if (y) years.add(y);
    });
    return Array.from(years).sort((a, b) => b - a);
  }

  function historyView() {
    const cur = state.settings.primary;
    const years = availableYears();
    if (years.indexOf(ui.historyYear) === -1) ui.historyYear = years[0];
    const year = ui.historyYear;

    const months = [];
    for (let m = 0; m < 12; m++) months.push(monthData(year + '-' + pad2(m + 1)));
    const monthKeys = months.map((m) => m.key);
    const withData = months.filter((m) => m.incomes.length || m.expenses.length);
    const yearIncome = sum(months, (m) => m.incomeBase);
    const yearExpense = sum(months, (m) => m.expenseBase);
    const yearNet = yearIncome - yearExpense;

    const rows = withData.slice().reverse().map((m) => {
      const totals = m.incomeBase || 1;
      return '<button class="month-row" type="button" data-action="open-month" data-month="' + m.key + '">' +
        '<span class="month-name"><strong>' + monthLabel(m.key) + '</strong>' +
          '<span>' + m.incomes.length + ' revenu' + (m.incomes.length > 1 ? 's' : '') + ' · ' +
            m.expenses.length + ' dépense' + (m.expenses.length > 1 ? 's' : '') + '</span></span>' +
        '<span class="month-num mn-exp"><span>Revenus</span>' + fmtMoney(baseTo(m.incomeBase, cur), cur, { decimals: 0 }) + '</span>' +
        '<span class="month-num mn-exp"><span>Dépenses</span>' + fmtMoney(baseTo(m.expenseBase, cur), cur, { decimals: 0 }) + '</span>' +
        '<span class="month-num"><span>Solde</span><span style="display:inline;font-size:13px;font-weight:600;letter-spacing:-.02em;text-transform:none;color:' +
          (m.net < 0 ? '#ffb0bb' : 'var(--text)') + '">' +
          fmtMoney(baseTo(m.net, cur), cur, { decimals: 0 }) + '</span></span>' +
        '<span class="seg-bar seg-bar-cell">' + PILLARS.map((p) =>
          '<i style="--pc:' + p.color + ';width:' + ((m.alloc[p.id] / totals) * 100).toFixed(2) + '%"></i>').join('') + '</span>' +
        '<span class="month-chev">' + icon('right') + '</span>' +
      '</button>';
    }).join('');

    const kpis = '<div class="bal-grid">' +
      '<div class="bal-card" style="--pc:#38bdf8"><div class="bc-name">Revenus ' + year + '</div>' +
        '<div class="bc-val">' + fmtMoney(baseTo(yearIncome, cur), cur, { decimals: 0 }) + '</div>' +
        '<div class="bc-sub">' + state.incomes.filter((t) => t.date.slice(0, 4) === String(year)).length + ' entrées</div></div>' +
      '<div class="bal-card" style="--pc:#fb7185"><div class="bc-name">Dépenses ' + year + '</div>' +
        '<div class="bc-val">' + fmtMoney(baseTo(yearExpense, cur), cur, { decimals: 0 }) + '</div>' +
        '<div class="bc-sub">' + state.expenses.filter((t) => t.date.slice(0, 4) === String(year)).length + ' sorties</div></div>' +
      '<div class="bal-card" style="--pc:#34d399"><div class="bc-name">Solde ' + year + '</div>' +
        '<div class="bc-val" style="color:' + (yearNet < 0 ? '#ffb0bb' : '#8cf0c8') + '">' +
          fmtMoney(baseTo(yearNet, cur), cur, { decimals: 0 }) + '</div>' +
        '<div class="bc-sub">taux d\'épargne ' + (yearIncome > 0 ? fmtPlain((yearNet / yearIncome) * 100, 0) + ' %' : '—') + '</div></div>' +
      '<div class="bal-card" style="--pc:#a78bfa"><div class="bc-name">Mois actifs</div>' +
        '<div class="bc-val">' + withData.length + '</div>' +
        '<div class="bc-sub">sur 12 mois</div></div>' +
    '</div>';

    return pageHead({
      eyebrow: 'Suivi mensuel',
      title: 'Historique',
      sub: 'Chaque mois, les revenus alloués, les dépenses par pilier et le solde.',
      actions: years.map((y) =>
        '<button class="chip' + (y === year ? ' is-on' : '') + '" type="button" data-action="set-year" data-year="' + y + '">' + y + '</button>'
      ).join('')
    }) +
    kpis +
    '<div class="grid" style="grid-template-columns:minmax(0,1fr);margin-bottom:16px">' +
      '<section class="card">' +
        '<div class="card-head">' +
          '<div><div class="card-title">Revenus & dépenses · ' + year + '</div>' +
          '<div class="card-sub">vue annuelle</div></div>' +
          '<div class="chart-legend">' +
            '<span class="legend-item" style="--c:#38bdf8"><i class="legend-swatch"></i>Revenus</span>' +
            '<span class="legend-item" style="--c:#fb7185"><i class="legend-swatch"></i>Dépenses</span>' +
          '</div>' +
        '</div>' +
        '<div data-chart="monthly-bars"></div>' +
      '</section>' +
    '</div>' +
    (withData.length
      ? '<div class="month-list">' + rows + '</div>'
      : '<section class="card">' + emptyState('calendar', 'Aucun mois enregistré pour ' + year,
          'Ajoutez un revenu ou une dépense pour voir apparaître le suivi mensuel.',
          '<button class="btn btn-sm btn-primary" type="button" data-action="goto" data-route="revenus" style="margin-top:8px">' +
          icon('plus') + ' Nouveau revenu</button>') + '</section>');
  }

  /* ---------------------------------------------------------------------------
     14. Rapport mensuel
     ------------------------------------------------------------------------ */
  function reportView() {
    const cur = state.settings.primary;
    const key = ui.reportMonth;
    const md = monthData(key);
    const prev = monthData(shiftMonth(key, -1));
    const life = lifeData();
    const savingsRate = md.incomeBase > 0 ? (md.net / md.incomeBase) * 100 : 0;
    const isCurrent = key === nowMonth();

    const cmp = (label, a, b, invert, suffix) => {
      const delta = pctChange(a, b);
      const good = delta === null ? null : (invert ? delta <= 0 : delta >= 0);
      const cls = delta === null ? '' : (good ? 'up' : 'down');
      const txt = delta === null ? '—' : (delta >= 0 ? '+' : '') + fmtPlain(delta, 1) + ' %';
      return '<div class="rp-cmp-row"><span>' + label + '</span>' +
        '<span class="cmp-val"><b>' + fmtMoney(baseTo(a, cur), cur, { decimals: 0 }) + '</b>' +
        (suffix ? ' <span class="sub">' + suffix + '</span>' : '') +
        '<span class="delta ' + cls + '">' + txt + '</span></span></div>';
    };

    const allocRows = PILLARS.map((p) => {
      const share = md.expenseBase > 0 ? (md.spent[p.id] / md.expenseBase) * 100 : 0;
      return '<tr>' +
        '<td><span class="cat" style="--pc:' + p.color + '"><i></i><b>' + p.name + '</b></span>' +
          '<div class="sub">' + p.hint + '</div></td>' +
        '<td class="num soft">' + p.pct + ' %</td>' +
        '<td class="num">' + fmtMoney(baseTo(md.alloc[p.id], cur), cur, { decimals: 0 }) + '</td>' +
        '<td class="num soft">' + fmtMoney(baseTo(md.spent[p.id], cur), cur, { decimals: 0 }) +
          '<div class="sub">' + fmtPlain(share, 0) + ' % des sorties</div></td>' +
        '<td class="num"><b>' + fmtMoney(baseTo(md.remaining[p.id], cur), cur, { decimals: 0 }) + '</b></td>' +
      '</tr>';
    }).join('');

    const expenseRows = PILLARS.map((p) => {
      const items = md.expenses.filter((t) => t.category === p.id);
      const amount = sum(items, (t) => t.base);
      return '<tr>' +
        '<td><span class="cat" style="--pc:' + p.color + '"><i></i><b>' + p.name + '</b></span></td>' +
        '<td class="num soft">' + items.length + '</td>' +
        '<td class="num">' + fmtMoney(baseTo(amount, cur), cur, { decimals: 0 }) + '</td>' +
        '<td class="num soft">' + (md.expenseBase > 0 ? fmtPlain((amount / md.expenseBase) * 100, 0) + ' %' : '—') + '</td>' +
      '</tr>';
    }).join('');

    const ops = md.incomes.map((t) => Object.assign({}, t, { type: 'in' }))
      .concat(md.expenses.map((t) => Object.assign({}, t, { type: 'out' })))
      .sort((a, b) => (a.date < b.date ? 1 : -1));

    const detailRows = ops.length ? ops.map((t) => {
      const isIn = t.type === 'in';
      const p = isIn ? null : (PILLAR_MAP[t.category] || PILLARS[2]);
      return '<tr>' +
        '<td class="soft" style="white-space:nowrap">' + dateLabel(t.date, false) + '</td>' +
        '<td>' + (isIn ? 'Revenu' : '<span class="cat" style="--pc:' + p.color + '"><i></i>' + p.name + '</span>') + '</td>' +
        '<td class="soft">' + escapeHtml(t.note || '—') + '</td>' +
        '<td class="num">' + (isIn ? '+' : '−') + fmtMoney(t.amount, t.currency) + '</td>' +
      '</tr>';
    }).join('') : '<tr><td colspan="4" class="soft" style="text-align:center;padding:22px 0">Aucune opération enregistrée ce mois-ci.</td></tr>';

    const ratesLine = CUR_ORDER.filter((c) => c !== PIVOT)
      .map((c) => '1 € = ' + fmtPlain(rateOf(c), 2) + ' ' + c).join(' · ');

    const doc =
      '<article class="report-doc" id="report-doc">' +
        '<header class="rp-head">' +
          '<div>' +
            '<div class="rp-brand">' +
              '<span class="brand-mark"><i></i><i></i><i></i><i></i></span>' +
              '<span><strong>Quatre</strong><em>Wealth allocation</em></span>' +
            '</div>' +
            '<div class="rp-head-rates" style="margin-top:14px">Taux : ' + ratesLine + '</div>' +
          '</div>' +
          '<div class="rp-meta">' +
            '<div class="rp-kicker">Rapport mensuel</div>' +
            '<h2>' + monthLabel(key) + '</h2>' +
            '<p>Généré le ' + new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) +
              (isCurrent ? ' · mois en cours' : '') + '</p>' +
          '</div>' +
        '</header>' +

        '<div class="rp-kpis">' +
          '<div class="rp-kpi"><span>Revenu total</span><strong>' +
            fmtMoney(baseTo(md.incomeBase, cur), cur, { decimals: 0 }) + '</strong>' +
            '<em>' + md.incomes.length + ' entrée' + (md.incomes.length > 1 ? 's' : '') + ' · toutes devises converties</em></div>' +
          '<div class="rp-kpi"><span>Dépenses</span><strong>' +
            fmtMoney(baseTo(md.expenseBase, cur), cur, { decimals: 0 }) + '</strong>' +
            '<em>' + md.expenses.length + ' opération' + (md.expenses.length > 1 ? 's' : '') + '</em></div>' +
          '<div class="rp-kpi ' + (md.net < 0 ? 'neg' : 'pos') + '"><span>Solde du mois</span><strong>' +
            (md.net < 0 ? '−' : '+') + fmtMoney(Math.abs(baseTo(md.net, cur)), cur, { decimals: 0 }) + '</strong>' +
            '<em>taux d\'épargne ' + fmtPlain(savingsRate, 0) + ' %</em></div>' +
        '</div>' +

        '<div class="rp-section">' +
          '<div class="rp-section-head"><h3>Revenu total par devise</h3><span>conversion indicative</span></div>' +
          '<div class="rp-cur-grid">' +
            CUR_ORDER.map((c) =>
              '<div class="rp-cur"><span>' + c + ' · ' + CURRENCIES[c].name + '</span>' +
                '<strong>' + fmtMoney(baseTo(md.incomeBase, c), c, { decimals: 0 }) + '</strong>' +
                '<em>solde du mois ' + (md.net < 0 ? '−' : '') + fmtMoney(Math.abs(baseTo(md.net, c)), c, { decimals: 0 }) + '</em>' +
              '</div>').join('') +
          '</div>' +
        '</div>' +

        '<div class="rp-section">' +
          '<div class="rp-section-head"><h3>Répartition détaillée</h3><span>règle 10 · 10 · 60 · 20</span></div>' +
          '<table class="rp-table">' +
            '<thead><tr><th>Pilier</th><th class="num">Part</th><th class="num">Alloué</th>' +
              '<th class="num">Dépensé</th><th class="num">Restant</th></tr></thead>' +
            '<tbody>' + allocRows + '</tbody>' +
            '<tfoot><tr><td>Total</td><td class="num">100 %</td>' +
              '<td class="num">' + fmtMoney(baseTo(md.incomeBase, cur), cur, { decimals: 0 }) + '</td>' +
              '<td class="num">' + fmtMoney(baseTo(md.expenseBase, cur), cur, { decimals: 0 }) + '</td>' +
              '<td class="num">' + fmtMoney(baseTo(md.net, cur), cur, { decimals: 0 }) + '</td></tr></tfoot>' +
          '</table>' +
        '</div>' +

        '<div class="rp-section">' +
          '<div class="rp-section-head"><h3>Dépenses par catégorie</h3><span>' +
            fmtMoney(baseTo(md.expenseBase, cur), cur, { decimals: 0 }) + ' au total</span></div>' +
          '<table class="rp-table">' +
            '<thead><tr><th>Pilier</th><th class="num">Opérations</th><th class="num">Montant</th><th class="num">Part</th></tr></thead>' +
            '<tbody>' + expenseRows + '</tbody>' +
          '</table>' +
        '</div>' +

        '<div class="rp-section">' +
          '<div class="rp-section-head"><h3>Comparaison avec le mois précédent</h3>' +
            '<span style="text-transform:capitalize">' + monthLabel(shiftMonth(key, -1)) + '</span></div>' +
          '<div class="rp-compare">' +
            cmp('Revenus', md.incomeBase, prev.incomeBase, false) +
            cmp('Dépenses', md.expenseBase, prev.expenseBase, true) +
            cmp('Solde', md.net, prev.net, false) +
          '</div>' +
          (md.expenseBase > prev.expenseBase
            ? '<p style="font-size:10.5px;color:var(--ink-faint);margin-top:10px">Vos dépenses sont en hausse de ' +
              fmtPlain(pctChange(md.expenseBase, prev.expenseBase), 1) + ' % par rapport au mois précédent.</p>'
            : prev.expenseBase > 0
              ? '<p style="font-size:10.5px;color:var(--ink-faint);margin-top:10px">Vos dépenses sont en baisse de ' +
                fmtPlain(Math.abs(pctChange(md.expenseBase, prev.expenseBase)), 1) + ' % par rapport au mois précédent.</p>'
              : '') +
        '</div>' +

        '<div class="rp-section">' +
          '<div class="rp-section-head"><h3>Solde global disponible</h3><span>cumul à ce jour</span></div>' +
          '<div class="rp-cur-grid">' +
            CUR_ORDER.map((c) =>
              '<div class="rp-cur"><span>' + c + '</span>' +
                '<strong>' + fmtMoney(baseTo(life.balanceBase, c), c, { decimals: 0 }) + '</strong>' +
                '<em>' + (c === cur ? 'devise principale' : '1 € = ' + fmtPlain(rateOf(c), 2) + ' ' + c) + '</em>' +
              '</div>').join('') +
          '</div>' +
        '</div>' +

        '<div class="rp-section">' +
          '<div class="rp-section-head"><h3>Détail des opérations</h3><span>' + ops.length + ' opération' + (ops.length > 1 ? 's' : '') + '</span></div>' +
          '<table class="rp-table">' +
            '<thead><tr><th>Date</th><th>Pilier</th><th>Note</th><th class="num">Montant</th></tr></thead>' +
            '<tbody>' + detailRows + '</tbody>' +
          '</table>' +
        '</div>' +

        '<div class="rp-note">' +
          '<span>Quatre · répartition automatique 10 / 10 / 60 / 20</span>' +
          '<span>Document généré localement — taux de change configurables.</span>' +
        '</div>' +
      '</article>';

    return pageHead({
      eyebrow: 'Rapport',
      title: 'Rapport mensuel',
      sub: 'Synthèse complète, comparaison et version imprimable.',
      actions: '<button class="btn" type="button" data-action="export-csv" data-month="' + key + '">' + icon('download') + ' CSV</button>' +
        '<button class="btn btn-primary" type="button" data-action="print">' + icon('printer') + ' Imprimer / PDF</button>'
    }) +
    '<div class="report-shell">' +
      '<div class="report-bar">' +
        '<div class="month-picker">' +
          '<button class="btn btn-icon" type="button" data-action="report-prev" aria-label="Mois précédent">' + icon('left') + '</button>' +
          '<input class="input" type="month" data-role="report-month" value="' + key + '" aria-label="Mois du rapport" ' +
            'style="width:168px;height:36px;text-align:center;font-size:12.5px">' +
          '<button class="btn btn-icon" type="button" data-action="report-next" aria-label="Mois suivant"' +
            (key >= nowMonth() ? ' disabled' : '') + '>' + icon('right') + '</button>' +
        '</div>' +
        '<span class="pill">' + icon('doc') + ' A4 · prêt à imprimer</span>' +
      '</div>' +
      doc +
    '</div>';
  }

  /* ---------------------------------------------------------------------------
     15. Réglages
     ------------------------------------------------------------------------ */
  function settingsView() {
    const cur = state.settings.primary;
    const rateRows = CUR_ORDER.filter((c) => c !== PIVOT).map((c) =>
      '<div class="rate-row">' +
        '<div class="rate-label">' +
          '<span class="cur-sym">' + CURRENCIES[c].symbol + '</span>' +
          '<div>' + CURRENCIES[c].name +
            '<em id="rate-hint-' + c + '">1 € = ' + fmtPlain(rateOf(c), 2) + ' ' + c + '</em></div>' +
        '</div>' +
        '<input class="input rate-input" type="text" inputmode="decimal" data-rate="' + c + '" ' +
          'value="' + fmtPlain(rateOf(c), 2) + '" aria-label="Taux de change euro vers ' + c + '">' +
      '</div>').join('');

    return pageHead({
      eyebrow: 'Configuration',
      title: 'Réglages',
      sub: 'Taux de change, devise principale et gestion de vos données.',
      actions: '<button class="btn" type="button" data-action="export-json">' + icon('save') + ' Sauvegarder</button>'
    }) +
    '<div class="settings-grid">' +

      '<section class="card">' +
        '<div class="card-head"><div><div class="card-title">Règle de répartition</div>' +
          '<div class="card-sub">méthode fixe, appliquée à chaque revenu</div></div>' +
          '<span class="pill pill-brand">fixe</span></div>' +
        PILLARS.map((p) =>
          '<div class="set-row" style="--pc:' + p.color + '">' +
            '<div style="display:flex;align-items:center;gap:12px">' +
              '<span class="pillar-ico">' + icon(p.icon) + '</span>' +
              '<div class="sr-txt"><strong>' + p.name + '</strong><p>' + p.hint + '</p></div>' +
            '</div>' +
            '<span class="pillar-pct" style="color:' + p.color + '">' + p.pct + ' %</span>' +
          '</div>').join('') +
        '<p class="field-hint" style="margin-top:14px">Les pourcentages ne sont pas modifiables : ils garantissent la discipline de la méthode.</p>' +
      '</section>' +

      '<section class="card">' +
        '<div class="card-head"><div><div class="card-title">Devise principale</div>' +
          '<div class="card-sub">celle de vos soldes et rapports</div></div></div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
          CUR_ORDER.map((c) =>
            '<button class="chip' + (c === cur ? ' is-on' : '') + '" type="button" data-action="set-primary" data-cur="' + c + '">' +
              CURRENCIES[c].symbol + ' ' + c + '</button>').join('') +
        '</div>' +
        '<div class="set-row" style="margin-top:8px">' +
          '<div class="sr-txt"><strong>Conversion de référence</strong>' +
            '<p>Chaque montant est enregistré en euros puis converti avec vos taux. Changer de devise principale ne modifie pas l\'historique.</p></div>' +
        '</div>' +
        '<div class="set-row" style="--pc:#34d399">' +
          '<div class="sr-txt"><strong>Stockage local</strong>' +
            '<p>' + (storageOK ? 'Vos données restent sur cet appareil (aucun serveur).' : 'Stockage indisponible — pensez à exporter votre sauvegarde.') + '</p></div>' +
          '<span class="pill ' + (storageOK ? 'pill-pos' : 'pill-neg') + '">' + (storageOK ? 'actif' : 'inactif') + '</span>' +
        '</div>' +
      '</section>' +

      '<section class="card">' +
        '<div class="card-head"><div><div class="card-title">Taux de change</div>' +
          '<div class="card-sub">modifiables manuellement — base euro</div></div>' +
          '<span class="pill">' + icon('refresh') + ' manuel</span></div>' +
        '<div style="background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:11px;padding:9px 12px;display:flex;justify-content:space-between;align-items:center;font-size:12px;margin-bottom:8px">' +
          '<span style="color:var(--text-2)">' + CURRENCIES[PIVOT].symbol + ' Euro</span>' +
          '<span style="color:var(--faint);font-size:11px">devise pivot · 1,00</span>' +
        '</div>' +
        rateRows +
        '<p class="field-hint" style="margin:12px 0 4px">Dernière mise à jour : ' + dateLabel(state.settings.ratesUpdated) + '. Les taux sont appliqués aux affichages et aux futures saisies.</p>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">' +
          '<button class="btn btn-sm" type="button" data-action="recalc">' + icon('refresh') + ' Recalculer l\'historique</button>' +
          '<button class="btn btn-sm btn-ghost" type="button" data-action="reset-rates">Taux par défaut</button>' +
        '</div>' +
      '</section>' +

      '<section class="card">' +
        '<div class="card-head"><div><div class="card-title">Données</div>' +
          '<div class="card-sub">' + (state.incomes.length + state.expenses.length) + ' opération(s) enregistrée(s)</div></div>' +
          '<span class="pill">' + icon('database') + ' local</span></div>' +
        '<div class="set-row">' +
          '<div class="sr-txt"><strong>Sauvegarde complète</strong><p>Fichier JSON à conserver ou transférer sur un autre appareil.</p></div>' +
          '<button class="btn btn-sm" type="button" data-action="export-json">Exporter</button>' +
        '</div>' +
        '<div class="set-row">' +
          '<div class="sr-txt"><strong>Restaurer une sauvegarde</strong><p>Remplace les données actuelles par le fichier choisi.</p></div>' +
          '<button class="btn btn-sm" type="button" data-action="import-json">Importer</button>' +
        '</div>' +
        '<div class="set-row">' +
          '<div class="sr-txt"><strong>Export tableur</strong><p>CSV compatible Excel / Numbers / Sheets.</p></div>' +
          '<button class="btn btn-sm" type="button" data-action="export-csv">CSV</button>' +
        '</div>' +
        '<div class="set-row">' +
          '<div class="sr-txt"><strong>Données d\'exemple</strong><p>Jeu de démonstration sur 6 mois pour découvrir l\'application.</p></div>' +
          '<button class="btn btn-sm" type="button" data-action="load-demo">Charger</button>' +
        '</div>' +
        '<div class="set-row">' +
          '<div class="sr-txt"><strong>Réinitialiser</strong><p>Efface toutes les opérations de cet appareil.</p></div>' +
          '<button class="btn btn-sm btn-danger" type="button" data-action="reset-all">Effacer</button>' +
        '</div>' +
        '<input type="file" id="import-file" accept="application/json,.json" hidden>' +
      '</section>' +

      '<section class="card span-2">' +
        '<div class="card-head"><div><div class="card-title">À propos</div>' +
          '<div class="card-sub">Quatre · version 1.0</div></div>' +
          '<span class="pill">' + icon('info') + ' hors-ligne</span></div>' +
        '<div class="grid about-grid">' +
          '<div class="kpi-mini"><span>Application</span><strong style="font-size:13px;line-height:1.5;font-weight:550;letter-spacing:0">100 % locale<br>sans compte</strong></div>' +
          '<div class="kpi-mini"><span>Stockage</span><strong style="font-size:13px;line-height:1.5;font-weight:550;letter-spacing:0">' +
            (storageOK ? 'localStorage actif' : 'mémoire de session') + '</strong></div>' +
          '<div class="kpi-mini"><span>Impressions</span><strong style="font-size:13px;line-height:1.5;font-weight:550;letter-spacing:0">Rapport A4<br>prêt à archiver</strong></div>' +
        '</div>' +
        '<p class="field-hint" style="margin-top:14px">Aucune connexion requise, aucune donnée envoyée. Pensez à exporter régulièrement votre sauvegarde JSON : vider les données du navigateur effacerait vos opérations.</p>' +
      '</section>' +

    '</div>';
  }

  /* ---------------------------------------------------------------------------
     16. Données d'exemple
     ------------------------------------------------------------------------ */
  function isoOf(d) {
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  function seedDemo(merge) {
    const now = new Date();
    const mk = nowMonth();
    const demoIn = [], demoExp = [];
    let seq = 0;

    const addIn = (amount, currency, date, note) => demoIn.push({
      id: uid(), amount: round2(amount), currency: currency, date: date,
      note: note, base: toBase(amount, currency), createdAt: Date.now() + (seq++), demo: true
    });
    const addOut = (category, amount, currency, date, note) => demoExp.push({
      id: uid(), amount: round2(amount), currency: currency, date: date, category: category,
      note: note, base: toBase(amount, currency), createdAt: Date.now() + (seq++), demo: true
    });
    /* cinq mois complets ---------------------------------------------------- */
    for (let back = 5; back >= 1; back--) {
      const idx = 5 - back;
      const key = shiftMonth(mk, -back);
      const day = (n) => key + '-' + pad2(n);
      const rev = 3800 + idx * 190;

      addIn(rev, 'EUR', day(4), idx % 2 ? 'Prestations clients' : 'Missions freelance');
      if (idx % 2 === 0) addIn(520 + idx * 35, 'USD', day(18), 'Formation en ligne');
      if (idx === 2) addIn(58000, 'JPY', day(11), 'Mission Tokyo');
      if (idx === 4) addIn(260, 'GBP', day(7), 'Consulting Londres');

      addOut('dime', rev * 0.10, 'EUR', day(6), 'Dîme mensuelle');
      addOut('charite', rev * 0.075, 'EUR', day(9), idx === 1 ? 'Association Les Restos' : 'Association locale');
      addOut('besoins', rev * 0.40, 'EUR', day(3), 'Loyer & charges');
      addOut('besoins', rev * 0.055, 'EUR', day(13), 'Courses');
      addOut('besoins', 120 + idx * 4, 'EUR', day(17), 'Transport & abonnements');
      addOut('investissement', rev * 0.18, 'EUR', day(20), idx % 2 ? 'ETF monde' : 'Apport épargne');
      if (idx === 3) addOut('charite', 80, 'GBP', day(22), 'Don international');
      if (idx === 1) addOut('investissement', 150, 'USD', day(24), 'Actions US');
    }

    /* mois en cours (dates passées uniquement) ------------------------------ */
    const backDate = (days) => isoOf(new Date(now.getFullYear(), now.getMonth(), Math.max(1, now.getDate() - days)));
    addIn(4200, 'EUR', backDate(17), 'Prestations clients');
    addIn(650, 'USD', backDate(10), 'Vente formation');
    addOut('dime', 420, 'EUR', backDate(15), 'Dîme mensuelle');
    addOut('charite', 150, 'EUR', backDate(14), 'Association locale');
    addOut('besoins', 1850, 'EUR', backDate(16), 'Loyer & charges');
    addOut('besoins', 264, 'EUR', backDate(6), 'Courses');
    addOut('investissement', 700, 'EUR', backDate(8), 'ETF monde');

    if (merge) {
      state.incomes = state.incomes.concat(demoIn);
      state.expenses = state.expenses.concat(demoExp);
    } else {
      state.incomes = demoIn;
      state.expenses = demoExp;
    }
    state.seeded = true;
    saveState();
  }

  function clearDemo() {
    state.incomes = state.incomes.filter((t) => !t.demo);
    state.expenses = state.expenses.filter((t) => !t.demo);
    saveState();
    render();
    toast('Données d\'exemple supprimées.');
  }

  /* ---------------------------------------------------------------------------
     17. Formulaires & aperçus
     ------------------------------------------------------------------------ */
  function parseAmount(v) {
    if (typeof v === 'number') return v;
    if (v === null || v === undefined || v === '') return NaN;
    const cleaned = String(v)
      .replace(/[\s\u00A0\u202F]/g, '')
      .replace(/[€$£¥]/g, '')
      .replace(',', '.');
    const n = parseFloat(cleaned);
    return isFinite(n) ? n : NaN;
  }

  function updateIncomePreview() {
    const form = $('#income-form');
    if (!form) return;
    const amount = parseAmount(form.elements.amount.value) || 0;
    const currency = form.elements.currency.value;
    PILLARS.forEach((p) => {
      const el = form.querySelector('[data-preview="' + p.id + '"]');
      if (!el) return;
      const val = amount * p.pct / 100;
      animateMoney(el, el._v === undefined ? val : el._v, val, currency, { dec: currency === 'JPY' ? 0 : 2 });
      el._v = val;
    });
    const totalEl = $('#inc-preview-total');
    if (totalEl) totalEl.textContent = amount > 0 ? fmtMoney(amount, currency) + ' · 100 %' : '—';
    const hint = $('#inc-converted');
    if (hint) {
      hint.textContent = amount <= 0
        ? 'Saisissez le montant dans la devise reçue.'
        : currency === state.settings.primary
          ? 'Devise principale — aucune conversion nécessaire.'
          : '≈ ' + fmtMoney(toBase(amount, currency), state.settings.primary) + ' · ' + rateLabel(currency);
    }
  }

  function updateExpensePreview() {
    const form = $('#expense-form');
    if (!form) return;
    const cat = $('#exp-category').value;
    const p = PILLAR_MAP[cat] || PILLARS[2];
    const amount = parseAmount(form.elements.amount.value) || 0;
    const currency = form.elements.currency.value;
    const cur = state.settings.primary;
    const before = lifeData().balance[cat];
    const after = before - toBase(amount, currency);

    const label = $('#exp-pillar-label');
    if (label) label.textContent = p.name;
    const dot = $('#exp-dot');
    if (dot) { dot.style.background = p.color; dot.style.boxShadow = '0 0 10px ' + p.color + '99'; }

    const bEl = $('#exp-before'), aEl = $('#exp-after');
    if (bEl) { animateMoney(bEl, bEl._v === undefined ? before : bEl._v, before, cur); bEl._v = before; }
    if (aEl) {
      animateMoney(aEl, aEl._v === undefined ? after : aEl._v, after, cur);
      aEl._v = after;
      aEl.style.color = after < 0 ? '#ffb0bb' : '';
    }
    const warn = $('#exp-warning');
    if (warn) {
      warn.innerHTML = after < 0
        ? '<div class="alert">' + icon('alert') + '<span>Cette dépense dépasse le solde du pilier : il deviendra négatif.</span></div>'
        : '';
    }
  }

  function onIncomeSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const amount = parseAmount(form.elements.amount.value);
    const currency = form.elements.currency.value;
    const date = form.elements.date.value || todayISO();
    const note = String(form.elements.note.value || '').trim().slice(0, 160);

    if (!(amount > 0)) {
      toast('Montant invalide — indiquez un nombre positif.', { type: 'warn' });
      form.elements.amount.focus();
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      toast('Date invalide.', { type: 'warn' });
      return;
    }
    const newId = uid();
    state.incomes.push({
      id: newId, amount: round2(amount), currency: currency, date: date,
      note: note, base: toBase(amount, currency), createdAt: Date.now()
    });
    saveState();
    render();
    toast('<b>+' + fmtMoney(amount, currency) + '</b> répartis : ' +
      PILLARS.map((p) => p.pct + ' % ' + p.name.toLowerCase()).join(' · ') + '.',
      { action: { label: 'Annuler', onClick: () => deleteTx('in', newId, true) } });
  }

  function onExpenseSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const category = $('#exp-category').value;
    const p = PILLAR_MAP[category] || PILLARS[2];
    const amount = parseAmount(form.elements.amount.value);
    const currency = form.elements.currency.value;
    const date = form.elements.date.value || todayISO();
    const note = String(form.elements.note.value || '').trim().slice(0, 160);

    if (!(amount > 0)) {
      toast('Montant invalide — indiquez un nombre positif.', { type: 'warn' });
      form.elements.amount.focus();
      return;
    }
    const after = lifeData().balance[category] - toBase(amount, currency);
    const newId = uid();
    state.expenses.push({
      id: newId, amount: round2(amount), currency: currency, date: date, category: category,
      note: note, base: toBase(amount, currency), createdAt: Date.now()
    });
    saveState();
    render();
    if (after < 0) {
      toast('Dépense enregistrée — le solde « ' + p.name + ' » est désormais négatif.', { type: 'warn' });
    } else {
      toast('<b>−' + fmtMoney(amount, currency) + '</b> sur ' + p.name + ' · reste ' +
        fmtMoney(baseTo(after, state.settings.primary), state.settings.primary),
        { action: { label: 'Annuler', onClick: () => deleteTx('out', newId, true) } });
    }
  }

  function deleteTx(type, id, silent) {
    const list = type === 'in' ? state.incomes : state.expenses;
    const idx = list.findIndex((t) => t.id === id);
    if (idx === -1) return;
    const removed = list.splice(idx, 1)[0];
    saveState();
    render();
    if (!silent) {
      toast((type === 'in' ? 'Revenu' : 'Dépense') + ' supprimé' +
        (removed.note ? ' · ' + escapeHtml(removed.note) : '') + '.', {
        type: 'warn',
        action: {
          label: 'Annuler',
          onClick: () => { list.splice(idx, 0, removed); saveState(); render(); toast('Suppression annulée.'); }
        }
      });
    }
  }

  /* ---------------------------------------------------------------------------
     18. Exports / imports
     ------------------------------------------------------------------------ */
  function csvCell(v) {
    return '"' + String(v === null || v === undefined ? '' : v).replace(/"/g, '""') + '"';
  }

  function exportCSV(month) {
    const items = txAll()
      .filter((t) => !month || dateToMonth(t.date) === month)
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    const rows = [['Type', 'Date', 'Pilier', 'Montant', 'Devise', 'Contre-valeur EUR', 'Note']];
    items.forEach((t) => rows.push([
      t.type === 'in' ? 'Revenu' : 'Dépense',
      t.date,
      t.type === 'in' ? 'Répartition 4 piliers' : (PILLAR_MAP[t.category] ? PILLAR_MAP[t.category].name : ''),
      String(t.amount).replace('.', ','),
      t.currency,
      String(round2(t.base)).replace('.', ','),
      t.note || ''
    ]));
    const csv = '\uFEFF' + rows.map((r) => r.map(csvCell).join(';')).join('\r\n');
    download('quatre-operations-' + (month || todayISO()) + '.csv', csv, 'text/csv;charset=utf-8');
    toast('Export CSV généré (' + items.length + ' opérations).');
  }

  function exportJSON() {
    const payload = JSON.stringify(state, null, 2);
    download('quatre-sauvegarde-' + todayISO() + '.json', payload, 'application/json');
    toast('Sauvegarde JSON exportée.');
  }

  function importFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function () {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!parsed || (!Array.isArray(parsed.incomes) && !Array.isArray(parsed.expenses))) throw new Error('format');
        state = normalize(parsed);
        numberMemory.clear();
        saveState();
        render();
        toast('Sauvegarde restaurée · ' + (state.incomes.length + state.expenses.length) + ' opérations.');
      } catch (err) {
        toast('Fichier invalide — sauvegarde JSON attendue.', { type: 'warn' });
      }
    };
    reader.onerror = function () { toast('Lecture du fichier impossible.', { type: 'warn' }); };
    reader.readAsText(file);
  }

  function applyRate(input) {
    const cur = input.dataset.rate;
    const v = parseAmount(input.value);
    if (!(v > 0)) {
      toast('Taux invalide.', { type: 'warn' });
      input.value = fmtPlain(rateOf(cur), 2);
      return;
    }
    state.settings.rates[cur] = v;
    state.settings.ratesUpdated = todayISO();
    saveState();
    input.value = fmtPlain(v, 2);
    const hint = $('#rate-hint-' + cur);
    if (hint) hint.textContent = '1 € = ' + fmtPlain(v, 2) + ' ' + cur;
    toast('Taux ' + cur + ' enregistré · 1 € = ' + fmtPlain(v, 2) + ' ' + cur + '.');
  }

  function resetRates() {
    state.settings.rates = Object.assign({}, DEFAULT_RATES, { EUR: 1 });
    state.settings.ratesUpdated = todayISO();
    saveState();
    numberMemory.clear();
    render();
    toast('Taux par défaut restaurés.');
  }

  function recalcHistory() {
    state.incomes.forEach((t) => { t.base = toBase(t.amount, t.currency); });
    state.expenses.forEach((t) => { t.base = toBase(t.amount, t.currency); });
    saveState();
    numberMemory.clear();
    render();
    toast('Historique recalculé avec les taux actuels.');
  }

  /* ---------------------------------------------------------------------------
     19. Navigation & rendu
     ------------------------------------------------------------------------ */
  const views = {
    dashboard: dashboardView,
    revenus: incomeView,
    depenses: expenseView,
    historique: historyView,
    rapport: reportView,
    reglages: settingsView
  };
  const TITLES = {
    dashboard: 'Vue d\'ensemble', revenus: 'Revenus', depenses: 'Dépenses',
    historique: 'Historique', rapport: 'Rapport mensuel', reglages: 'Réglages'
  };

  function parseRoute() {
    const raw = String(location.hash || '').replace(/^#\/?/, '').split('?')[0];
    return PAGES.indexOf(raw) >= 0 ? raw : 'dashboard';
  }

  function setRoute(route) {
    if (PAGES.indexOf(route) === -1) return;
    const target = '#/' + route;
    if (location.hash === target) render();
    else location.hash = target;
  }

  function renderMiniBalance() {
    const el = $('#mini-balance');
    if (!el) return;
    const life = lifeData();
    const cur = state.settings.primary;
    el.innerHTML =
      '<div class="mb-label">Solde disponible</div>' +
      '<div class="mb-value">' + num(life.balanceBase, cur, 'mini.balance') + '</div>' +
      '<div class="mb-sub"><span>' + CUR_ORDER.length + ' devises</span><span>' +
        state.incomes.length + ' revenus</span></div>';
    hydrateNumbers(el);
  }

  function render() {
    const view = $('#view');
    if (!view) return;
    const route = parseRoute();
    const changed = route !== ui.route || !view.dataset.rendered;
    let html = '';
    try {
      html = views[route]();
    } catch (err) {
      console.error(err);
      html = '<section class="card">' + emptyState('alert', 'Une erreur est survenue',
        'Rechargez la page pour reprendre. Vos données sont conservées.') + '</section>';
    }
    view.innerHTML = html;
    view.dataset.rendered = '1';
    ui.route = route;
    document.title = 'Quatre — ' + TITLES[route];
    const printMeta = $('#print-meta');
    if (printMeta) {
      printMeta.textContent = TITLES[route] + ' · ' +
        new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    $$('.nav-item').forEach((a) => {
      const on = a.dataset.route === route;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });

    renderMiniBalance();
    hydrateNumbers(view);
    mountCharts(view);
    if (route === 'revenus') updateIncomePreview();
    if (route === 'depenses') updateExpensePreview();
    ui.lastWidth = view.clientWidth;
    if (changed) window.scrollTo(0, 0);
  }

  /* ---------------------------------------------------------------------------
     20. Actions
     ------------------------------------------------------------------------ */
  const ACTIONS = {
    goto: function (btn) { setRoute(btn.dataset.route); },
    print: function () { window.print(); },
    'export-json': exportJSON,
    'export-csv': function (btn) { exportCSV(btn.dataset.month || null); },
    'import-json': function () { const f = $('#import-file'); if (f) f.click(); },
    'clear-demo': clearDemo,
    'load-demo': function () {
      openModal({
        title: 'Charger les données d\'exemple ?',
        body: 'Six mois de revenus et de dépenses fictifs seront ajoutés à vos données actuelles. Vous pourrez les supprimer à tout moment.',
        confirm: 'Charger les exemples',
        onConfirm: function () { seedDemo(true); numberMemory.clear(); render(); toast('Données d\'exemple ajoutées.'); }
      });
    },
    'reset-all': function () {
      openModal({
        title: 'Effacer toutes les données ?',
        body: 'Vos revenus et dépenses seront définitivement supprimés de cet appareil. Exportez une sauvegarde JSON avant si nécessaire.',
        confirm: 'Tout effacer',
        danger: true,
        onConfirm: function () {
          state = makeState();
          state.seeded = true;
          numberMemory.clear();
          saveState();
          render();
          toast('Toutes les données ont été effacées.', { type: 'warn' });
        }
      });
    },
    'set-primary': function (btn) {
      const c = btn.dataset.cur;
      if (!CURRENCIES[c] || c === state.settings.primary) return;
      state.settings.primary = c;
      numberMemory.clear();
      saveState();
      render();
      toast('Devise principale : ' + c + '.');
    },
    'reset-rates': resetRates,
    recalc: recalcHistory,
    del: function (btn) { deleteTx(btn.dataset.type, btn.dataset.id); },
    'open-month': function (btn) {
      ui.reportMonth = btn.dataset.month;
      setRoute('rapport');
    },
    'report-prev': function () {
      ui.reportMonth = shiftMonth(ui.reportMonth, -1);
      render();
    },
    'report-next': function () {
      const next = shiftMonth(ui.reportMonth, 1);
      if (next > nowMonth()) return;
      ui.reportMonth = next;
      render();
    },
    'pick-category': function (btn) {
      const cat = btn.dataset.cat;
      const form = $('#expense-form');
      if (!form) return;
      $('#exp-category').value = cat;
      $$('.seg-opt', form).forEach((b) => {
        const on = b.dataset.cat === cat;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      updateExpensePreview();
    },
    'filter-expense': function (btn) {
      ui.expenseFilter = btn.dataset.cat;
      ui.expenseLimit = 14;
      render();
    },
    'more-expense': function () { ui.expenseLimit += 20; render(); },
    'more-income': function () { ui.incomeLimit += 20; render(); },
    'set-year': function (btn) {
      ui.historyYear = Number(btn.dataset.year);
      render();
    }
  };

  /* ---------------------------------------------------------------------------
     21. Écouteurs & démarrage
     ------------------------------------------------------------------------ */
  function onClick(e) {
    const actionEl = e.target.closest('[data-action]');
    if (actionEl) {
      const fn = ACTIONS[actionEl.dataset.action];
      if (fn) { e.preventDefault(); fn(actionEl); }
      return;
    }
    if (e.target.closest('[data-modal-close]')) closeModal();
  }

  function onSubmit(e) {
    if (e.target.id === 'income-form') onIncomeSubmit(e);
    else if (e.target.id === 'expense-form') onExpenseSubmit(e);
  }

  function onInput(e) {
    const t = e.target;
    if (t.closest('#income-form') && (t.name === 'amount' || t.name === 'currency')) updateIncomePreview();
    if (t.closest('#expense-form') && (t.name === 'amount' || t.name === 'currency')) updateExpensePreview();
    if (t.dataset && t.dataset.rate) {
      const hint = $('#rate-hint-' + t.dataset.rate);
      const v = parseAmount(t.value);
      if (hint && v > 0) hint.textContent = '1 € = ' + fmtPlain(v, 2) + ' ' + t.dataset.rate;
    }
  }

  function onChange(e) {
    const t = e.target;
    if (t.matches('[data-role="income-filter"]')) { ui.incomeMonth = t.value; ui.incomeLimit = 14; render(); }
    else if (t.matches('[data-role="report-month"]')) {
      if (/^\d{4}-\d{2}$/.test(t.value)) { ui.reportMonth = t.value; render(); }
    } else if (t.matches('[data-rate]')) applyRate(t);
    else if (t.id === 'import-file') { importFile(t.files && t.files[0]); t.value = ''; }
  }

  function onKey(e) {
    if (e.key === 'Escape') closeModal();
  }

  function init() {
    $$('[data-icon]').forEach((el) => { el.innerHTML = icon(el.dataset.icon); });

    let stored = false;
    try { stored = window.localStorage.getItem(STORAGE_KEY) !== null; } catch (err) { stored = true; }
    if (!stored) seedDemo(false);

    document.addEventListener('click', onClick);
    document.addEventListener('submit', onSubmit);
    document.addEventListener('input', onInput);
    document.addEventListener('change', onChange);
    document.addEventListener('keydown', onKey);
    window.addEventListener('hashchange', render);
    window.addEventListener('beforeprint', () => document.body.classList.add('printing'));
    window.addEventListener('afterprint', () => document.body.classList.remove('printing'));

    if (!storageOK) {
      toast('Stockage local indisponible : exportez votre sauvegarde avant de fermer.', { type: 'warn', duration: 8000 });
    }
    if (!location.hash) {
      try { history.replaceState(null, '', '#/dashboard'); } catch (err) {}
    }
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();

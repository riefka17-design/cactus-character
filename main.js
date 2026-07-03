/* =========================================================
   CACTUS — Character You with Us
   Vanilla JS + Supabase. No frameworks.
   ========================================================= */

'use strict';

import { createClient } from '@supabase/supabase-js';
import QRCode from 'qrcode';

/* ── Supabase client ─────────────────────────────────────── */
const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // This is the #1 cause of "nothing works" bugs: the env vars aren't
  // actually set (or aren't prefixed with VITE_) at build time.
  console.error(
    '[CACTUS] Missing Supabase env vars. VITE_SUPABASE_URL:',
    SUPABASE_URL, 'VITE_SUPABASE_ANON_KEY set:', !!SUPABASE_ANON_KEY
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* Small helper so every Supabase error is visible in the console
   instead of silently vanishing behind a generic UI message. */
function logSupabaseError(context, error) {
  if (!error) return;
  console.error(`[CACTUS] Supabase error in ${context}:`, {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
  });
}

/* Turn a Supabase error into a readable string for the UI.
   Falls back to a generic message only if nothing useful exists. */
function friendlyError(error, fallback) {
  if (!error) return fallback;
  if (error.code === '42501') {
    return 'Permission denied by Supabase (Row Level Security). Ask the site owner to add an insert/select policy for this table.';
  }
  return error.message || error.details || fallback;
}

/* ─────────────────────────────────────────────────────────
   1. CHARACTER CATEGORIES
   ───────────────────────────────────────────────────────── */
const CATEGORIES = [
{ id: 'skin', label: 'Skin', folder: 'skin', options: [
{ file: 'skin1.png', name: 'Porcelain' },
{ file: 'skin2.png', name: 'Ivory' },
{ file: 'skin3.png', name: 'Cream' },
{ file: 'skin4.png', name: 'Tan' },
{ file: 'skin5.png', name: 'Mocha' },
{ file: 'skin6.png', name: 'Avatar' }
]},


{ id: 'naturalflush', label: 'Natural Flush', folder: 'naturalflush', options: [
{ file: 'naturalflush1.png', name: 'Soft Pink' },
{ file: 'naturalflush2.png', name: 'Rose Pink' },
{ file: 'naturalflush3.png', name: 'Peach' },
{ file: 'naturalflush4.png', name: 'Apricot' },
{ file: 'naturalflush5.png', name: 'Coral' },
{ file: 'naturalflush6.png', name: 'Soft Mauve' },
{ file: 'naturalflush7.png', name: 'Terracotta' },
{ file: 'naturalflush8.png', name: 'Warm Berry' },
{ file: 'naturalflush9.png', name: 'Cocoa Rose' },
{ file: 'naturalflush10.png', name: 'None' }
]},


{ id: 'hair', label: 'Hair', folder: 'hair', options: [
{ file: 'hair1.png', name: 'Sakura Pink Short Bob' },
{ file: 'hair2.png', name: 'Ice Blue Short Bob' },
{ file: 'hair3.png', name: 'Brown Short Bob' },
{ file: 'hair4.png', name: 'Cherry Red Short Bob' },
{ file: 'hair5.png', name: 'Yellow Spiky Hair' },
{ file: 'hair6.png', name: 'Gray Spiky Hair' },
{ file: 'hair7.png', name: 'Blue Spiky Hair' },
{ file: 'hair8.png', name: 'Red Spiky Hair' },
{ file: 'hair9.png', name: 'Brown Classic Bun' },
{ file: 'hair10.png', name: 'Pink Classic Bun' },
{ file: 'hair11.png', name: 'Yellow Classic Bun' },
{ file: 'hair12.png', name: 'None' }
]},


{ id: 'eyes', label: 'Eyes', folder: 'eyes', options: [
{ file: 'eyes1.png', name: 'Innocent Cocoa' },
{ file: 'eyes2.png', name: 'Gentle Purple' },
{ file: 'eyes3.png', name: 'Gentle Brown' },
{ file: 'eyes4.png', name: 'Gentle Blue' },
{ file: 'eyes5.png', name: 'Gentle Emerald' },
{ file: 'eyes6.png', name: 'Classic Amber' },
{ file: 'eyes7.png', name: 'Classic Sea' },
{ file: 'eyes8.png', name: 'Classic Violet' },
{ file: 'eyes9.png', name: 'Doe Leaf' },
{ file: 'eyes10.png', name: 'Doe Sky' },
{ file: 'eyes11.png', name: 'Doe Brown' },
{ file: 'eyes12.png', name: 'Doe Violet' },
{ file: 'eyes13.png', name: 'Curious Teal' },
{ file: 'eyes14.png', name: 'Curious Blue' },
{ file: 'eyes15.png', name: 'Curious Purple' },
{ file: 'eyes16.png', name: 'Soft Sky' },
{ file: 'eyes17.png', name: 'Soft Emerald' },
{ file: 'eyes18.png', name: 'Soft Wood' }
]},


{ id: 'eyebrows', label: 'Eyebrows', folder: 'eyebrows', options: [
{ file: 'brows1.png', name: 'Soft Arch' },
{ file: 'brows2.png', name: 'Gentle Arch' },
{ file: 'brows3.png', name: 'Natural Arch' },
{ file: 'brows4.png', name: 'Straight' },
{ file: 'brows5.png', name: 'Relaxed' },
{ file: 'brows6.png', name: 'Cute Curve' },
{ file: 'brows7.png', name: 'None' }
]},


{ id: 'mouth', label: 'Mouth', folder: 'mouth', options: [
{ file: 'mouth1.png', name: 'Smile' },
{ file: 'mouth2.png', name: 'Frown' },
{ file: 'mouth3.png', name: 'Ooh' },
{ file: 'mouth4.png', name: 'Gasp' },
{ file: 'mouth5.png', name: 'Pout' },
{ file: 'mouth6.png', name: 'Grin' }
]},


{ id: 'blush', label: 'Blush', folder: 'blush', options: [
{ file: 'blush1.png', name: 'Stripe Blush' },
{ file: 'blush2.png', name: 'Cheek Blush' },
{ file: 'blush3.png', name: 'Dot Blush' },
{ file: 'blush4.png', name: 'Side Stripe Blush' },
{ file: 'blush5.png', name: 'None' }
]},


{ id: 'hijab', label: 'Hijab', folder: 'hijab', options: [
{ file: 'hijab1.png', name: 'None' }
]},


{ id: 'top', label: 'Top', folder: 'tops', options: [
{ file: 'top1.png', name: 'Top 1' },
{ file: 'top2.png', name: 'Top 2' },
{ file: 'top5.png', name: 'None' }
]},


{ id: 'bottom', label: 'Bottom', folder: 'bottoms', options: [
{ file: 'bottom1.png', name: 'Bottom 1' },
{ file: 'bottom4.png', name: 'None' }
]},


{ id: 'dress', label: 'Dress', folder: 'dress', options: [
{ file: 'dress1.png', name: 'Dress 1' },
{ file: 'dress2.png', name: 'Dress 2' },
{ file: 'dress3.png', name: 'Dress 3' },
{ file: 'dress4.png', name: 'Dress 4' },
{ file: 'dress5.png', name: 'None' }
]},


{ id: 'accessory', label: 'Accessories', folder: 'accessories', options: [
{ file: 'acc1.png', name: 'Acc 1' },
{ file: 'acc2.png', name: 'Acc 2' },
{ file: 'acc3.png', name: 'Acc 3' },
{ file: 'acc4.png', name: 'Acc 4' },
{ file: 'acc5.png', name: 'None' }
]},


{ id: 'hobby', label: 'Hobby', folder: 'hobbies', options: [
{ file: 'hobby1.png', name: 'Hobby 1' },
{ file: 'hobby2.png', name: 'Hobby 2' },
{ file: 'hobby3.png', name: 'Hobby 3' },
{ file: 'hobby4.png', name: 'Hobby 4' },
{ file: 'hobby5.png', name: 'None' }
]},


{ id: 'background', label: 'Background', folder: 'background', options: [
{ file: 'bg1.png', name: 'Plain White' },
{ file: 'bg2.png', name: 'Soft Blue' },
{ file: 'bg3.png', name: 'Cream Beige' },
{ file: 'bg4.png', name: 'Mint Green' },
{ file: 'bg5.png', name: 'Sunny Meadow' },
{ file: 'bg6.png', name: 'Cozy Room' },
{ file: 'bg7.png', name: 'Minimal Interior' },
{ file: 'bg8.png', name: 'Living Room' },
{ file: 'bg9.png', name: 'Victorian Hall' },
{ file: 'bg10.png', name: 'Carnival Night' },
{ file: 'bg11.png', name: 'Hallowen Street' },
{ file: 'bg12.png', name: 'Fireplace Lounge' },
{ file: 'bg13.png', name: 'None' }
]},
];

/* Helper: look up the {file, name} option object for a category + filename */
function findOption(cat, filename) {
  return cat.options.find(o => o.file === filename) || null;
}

/* ─────────────────────────────────────────────────────────
   2. CHARACTER STATE
   ───────────────────────────────────────────────────────── */
function defaultState() {
  const s = {};
  CATEGORIES.forEach(c => { s[c.id] = c.options[0].file; });
  return s;
}

let state = (() => {
  try {
    const saved = localStorage.getItem('cactus-char');
    return saved ? JSON.parse(saved) : defaultState();
  } catch { return defaultState(); }
})();

function saveCharState() {
  try { localStorage.setItem('cactus-char', JSON.stringify(state)); } catch {}
}

/* ─────────────────────────────────────────────────────────
   3. REGISTRATION STATE
   ───────────────────────────────────────────────────────── */
const regState = {
  workshopId:         null,
  workshop:           null,
  step:               1,
  formData: {
    full_name:         '',
    nickname:          '',
    phone:             '',
    email:             '',
    university:        '',
    faculty:           '',
    student_id:        '',
    emergency_contact: '',
    special_notes:     '',
    dietary:           '',
    accessibility:     '',
    character_name:    '',
  },
  registrationId:     null,
  registrationNumber: null,
  seatNumber:         null,
};

function getMyRegistrations() {
  try {
    const saved = localStorage.getItem('cactus-my-regs');
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
}

function addMyRegistration(entry) {
  try {
    const list = getMyRegistrations();
    if (!list.find(r => r.id === entry.id)) list.unshift(entry);
    localStorage.setItem('cactus-my-regs', JSON.stringify(list));
  } catch {}
}

/* ─────────────────────────────────────────────────────────
   4. ROUTER
   ───────────────────────────────────────────────────────── */
const PAGE_IDS = ['main','workshops','workshop-detail','register','payment','confirmation','dashboard'];
let currentPage = 'main';

function navigateTo(pageId, params = {}) {
  PAGE_IDS.forEach(id => {
    document.getElementById(`page-${id}`)?.classList.remove('active');
  });
  document.getElementById(`page-${pageId}`)?.classList.add('active');
  currentPage = pageId;

  document.querySelectorAll('.nav-link').forEach(a => {
    a.classList.remove('nav-active');
    const nav = a.dataset.nav;
    if (pageId === 'main'            && nav === 'home')       a.classList.add('nav-active');
    if (['workshops','workshop-detail','register','payment','confirmation'].includes(pageId) && nav === 'workshops') a.classList.add('nav-active');
    if (pageId === 'dashboard'       && nav === 'dashboard')  a.classList.add('nav-active');
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (pageId === 'main' && params.scroll) {
    setTimeout(() => {
      document.getElementById(params.scroll)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  }

  if (pageId === 'workshops')                              loadWorkshops();
  if (pageId === 'dashboard')                              renderDashboard();
  if (pageId === 'workshop-detail' && params.workshopId)  loadWorkshopDetail(params.workshopId);
  if (pageId === 'register'        && params.workshopId)  initRegistration(params.workshopId);
  if (pageId === 'payment')                                renderPaymentPage();
  if (pageId === 'confirmation'    && params.registrationId) renderConfirmation(params.registrationId);
}

/* ─────────────────────────────────────────────────────────
   5. GLOBAL CLICK DELEGATION
   ───────────────────────────────────────────────────────── */
document.addEventListener('click', e => {
  const trigger = e.target.closest('[data-nav]');
  if (!trigger) return;
  e.preventDefault();
  const page   = trigger.dataset.nav;
  const scroll = trigger.dataset.scroll || null;
  if (page === 'home') {
    navigateTo('main', scroll ? { scroll } : {});
  } else {
    navigateTo(page);
  }
});

/* Mobile burger */
document.getElementById('nav-burger')?.addEventListener('click', () => {
  document.getElementById('nav-links')?.classList.toggle('nav-links-open');
});
document.getElementById('nav-links')?.addEventListener('click', () => {
  document.getElementById('nav-links')?.classList.remove('nav-links-open');
});

/* ─────────────────────────────────────────────────────────
   6. CHARACTER CREATOR (preserved from original)
   ───────────────────────────────────────────────────────── */
const tabsEl    = document.getElementById('tabs');
const optionsEl = document.getElementById('options');
const previewEl = document.getElementById('preview');
let activeCategory = CATEGORIES[0].id;

function renderTabs() {
  tabsEl.innerHTML = '';
  CATEGORIES.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'tab' + (cat.id === activeCategory ? ' active' : '');
    btn.textContent = cat.label;
    btn.addEventListener('click', () => {
      activeCategory = cat.id;
      renderTabs();
      renderOptions();
    });
    tabsEl.appendChild(btn);
  });
}

function renderOptions() {
  optionsEl.innerHTML = '';
  const cat = CATEGORIES.find(c => c.id === activeCategory);

  cat.options.forEach(opt => {
    const div = document.createElement('div');
    div.className = 'option' + (state[cat.id] === opt.file ? ' active' : '');
    div.title = opt.name;
    const img = document.createElement('img');
    img.src = `/assets/${cat.folder}/${opt.file}`;
    img.alt = opt.name;
    div.appendChild(img);
    const label = document.createElement('span');
    label.className = 'opt-label';
    label.textContent = opt.name;
    div.appendChild(label);
    div.addEventListener('click', () => {
      state[cat.id] = opt.file;
      updateLayer(cat.id, opt.file);
      saveCharState();
      renderOptions();
    });
    optionsEl.appendChild(div);
  });
}

function updateLayer(layerId, filename) {
  const cat = CATEGORIES.find(c => c.id === layerId);
  const img = previewEl.querySelector(`[data-layer="${layerId}"]`);
  if (!img || !cat) return;
  const opt = findOption(cat, filename);
  if (!filename || !opt) {
    img.style.display = 'none';
  } else {
    img.style.display = '';
    img.src = `/assets/${cat.folder}/${opt.file}`;
  }
}

function applyState() {
  CATEGORIES.forEach(cat => updateLayer(cat.id, state[cat.id]));
}

document.getElementById('btn-random')?.addEventListener('click', () => {
  CATEGORIES.forEach(cat => {
    const opt = cat.options[Math.floor(Math.random() * cat.options.length)];
    state[cat.id] = opt.file;
  });
  applyState();
  saveCharState();
  renderOptions();
});

document.getElementById('btn-reset')?.addEventListener('click', () => {
  state = defaultState();
  applyState();
  saveCharState();
  renderOptions();
});

document.getElementById('btn-download')?.addEventListener('click', async () => {
  const SIZE = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = SIZE;
  const ctx = canvas.getContext('2d');
  const layerEls = previewEl.querySelectorAll('.layer');
  const order = [];
  layerEls.forEach(el => {
    const layerId = el.dataset.layer;
    const cat = CATEGORIES.find(c => c.id === layerId);
    if (!cat) return;
    const filename = state[layerId];
    if (!filename) return;
    order.push({ src: `/assets/${cat.folder}/${filename}` });
  });

  function loadImg(src) {
    return new Promise((resolve) => {
      const im = new Image();
      im.crossOrigin = 'anonymous';
      im.onload  = () => resolve(im);
      im.onerror = () => resolve(null);
      im.src = src;
    });
  }

  let skipped = 0;
  for (const item of order) {
    const im = await loadImg(item.src);
    if (!im) { skipped++; continue; }
    try {
      ctx.drawImage(im, 0, 0, SIZE, SIZE);
    } catch (drawErr) {
      skipped++;
    }
  }

  try {
    const link = document.createElement('a');
    link.download = 'my-cactus-character.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    if (skipped > 0) {
      console.warn(`${skipped} layer dilewati karena gambar tidak terbaca.`);
    }
  } catch (err) {
    alert('Sorry, could not generate the PNG. Please try again.');
  }
});
/* ─────────────────────────────────────────────────────────
   7. HELPER: MINI CHARACTER PREVIEW
   ───────────────────────────────────────────────────────── */
function makeCharPreview(charState, size) {
  const sizeClass = size || 'md';
  const wrap = document.createElement('div');
  wrap.className = `char-preview char-preview-${sizeClass}`;
  CATEGORIES.forEach(cat => {
    if (cat.id === 'background') return;
    const val = charState?.[cat.id];
    if (!val) return;
    const img = document.createElement('img');
    img.src       = `/assets/${cat.folder}/${val}`;
    img.alt       = '';
    img.className = 'char-preview-layer';
    wrap.appendChild(img);
  });
  return wrap;
}

/* ─────────────────────────────────────────────────────────
   8. UTILITY FORMATTERS
   ───────────────────────────────────────────────────────── */
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}
function formatTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hr = parseInt(h, 10);
  return `${hr > 12 ? hr - 12 : hr === 0 ? 12 : hr}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
}
function formatPrice(p) {
  return `Rp ${Number(p || 0).toLocaleString('id-ID')}`;
}
function seatsLeft(w) { return (w.seats_total || 0) - (w.seats_taken || 0); }

const DIFFICULTY_LABEL = { beginner: 'Beginner Friendly', intermediate: 'Intermediate', advanced: 'Advanced' };
const DIFFICULTY_COLOR = { beginner: 'sage', intermediate: 'honey', advanced: 'pink' };

/* ─────────────────────────────────────────────────────────
   9. WORKSHOP LISTING
   ───────────────────────────────────────────────────────── */
async function loadWorkshops() {
  const grid = document.getElementById('workshops-grid');
  if (!grid) return;
  grid.innerHTML = `<div class="workshops-loading"><span class="loading-spinner"></span><p>Finding cozy workshops for you…</p></div>`;

  const { data, error } = await supabase.from('workshops').select('*').order('date', { ascending: true });

  if (error) {
    logSupabaseError('loadWorkshops', error);
    grid.innerHTML = `<p class="error-msg">Could not load workshops.<br><small>${escHtml(friendlyError(error, 'Please try again later.'))}</small></p>`;
    return;
  }
  renderWorkshopCards(data || [], grid);
}

function renderWorkshopCards(workshops, grid) {
  grid.innerHTML = '';
  if (!workshops.length) {
    grid.innerHTML = '<p class="empty-msg">No workshops available right now. Check back soon!</p>';
    return;
  }
  workshops.forEach(w => {
    const left = seatsLeft(w);
    const card = document.createElement('div');
    card.className = 'workshop-card';
    card.style.setProperty('--card-color', w.color || '#c8dbc0');
    card.innerHTML = `
      <div class="wcard-top">
        <div class="wcard-emoji">${w.emoji || '✿'}</div>
        <div class="wcard-badges">
          <span class="badge badge-${DIFFICULTY_COLOR[w.difficulty] || 'sage'}">${DIFFICULTY_LABEL[w.difficulty] || w.difficulty}</span>
          <span class="badge badge-price">${formatPrice(w.price)}</span>
        </div>
      </div>
      <div class="wcard-body">
        <div class="wcard-theme">${w.theme || ''}</div>
        <h3 class="wcard-title">${w.title}</h3>
        <p class="wcard-desc">${(w.description || '').slice(0, 110)}…</p>
        <div class="wcard-meta">
          <div class="wcard-meta-item">📅 <span>${formatDate(w.date)}</span></div>
          <div class="wcard-meta-item">🕐 <span>${formatTime(w.time_start)} – ${formatTime(w.time_end)}</span></div>
          <div class="wcard-meta-item">📍 <span>${w.location || ''}</span></div>
          <div class="wcard-meta-item">👩‍🏫 <span>${w.instructor || ''}</span></div>
        </div>
        <div class="wcard-seats">
          <div class="seats-bar"><div class="seats-fill" style="width:${Math.min(100, ((w.seats_taken || 0) / (w.seats_total || 1)) * 100)}%"></div></div>
          <span class="seats-label">${left} seat${left !== 1 ? 's' : ''} left of ${w.seats_total}</span>
        </div>
        <div class="wcard-deadline">📋 Register by ${formatDate(w.deadline)}</div>
      </div>
      <div class="wcard-footer">
        <button class="btn btn-primary wcard-btn" ${left === 0 ? 'disabled' : ''}>
          ${left === 0 ? 'Fully Booked' : 'Join this Workshop ✦'}
        </button>
      </div>
    `;
    if (left > 0) {
      card.querySelector('.wcard-btn').addEventListener('click', e => {
        e.stopPropagation();
        navigateTo('workshop-detail', { workshopId: w.id });
      });
    }
    card.addEventListener('click', () => {
      if (left > 0) navigateTo('workshop-detail', { workshopId: w.id });
    });
    grid.appendChild(card);
  });
}

/* ─────────────────────────────────────────────────────────
   10. WORKSHOP DETAIL
   ───────────────────────────────────────────────────────── */
async function loadWorkshopDetail(id) {
  const content = document.getElementById('detail-content');
  if (!content) return;
  content.innerHTML = `<div class="workshops-loading"><span class="loading-spinner"></span><p>Loading workshop…</p></div>`;

  document.getElementById('detail-back')?.addEventListener('click', () => navigateTo('workshops'), { once: true });

  const { data: w, error } = await supabase.from('workshops').select('*').eq('id', id).maybeSingle();
  if (error || !w) {
    logSupabaseError('loadWorkshopDetail', error);
    content.innerHTML = `<p class="error-msg">Workshop not found.${error ? `<br><small>${escHtml(friendlyError(error, ''))}</small>` : ''}</p>`;
    return;
  }

  regState.workshopId = w.id;
  regState.workshop   = w;

  const schedule = Array.isArray(w.schedule) ? w.schedule : [];
  const faqs     = Array.isArray(w.faqs)     ? w.faqs     : [];
  const materials = Array.isArray(w.materials_included) ? w.materials_included : [];
  const bring     = Array.isArray(w.what_to_bring)      ? w.what_to_bring      : [];
  const left      = seatsLeft(w);

  content.innerHTML = `
    <div class="detail-hero" style="--card-color:${w.color || '#c8dbc0'}">
      <div class="detail-emoji-bg">${w.emoji || '✿'}</div>
      <div class="detail-hero-content">
        <span class="badge badge-${DIFFICULTY_COLOR[w.difficulty] || 'sage'}">${DIFFICULTY_LABEL[w.difficulty] || ''}</span>
        <div class="detail-theme">${w.theme || ''}</div>
        <h1 class="detail-title">${w.title}</h1>
        <div class="detail-meta-strip">
          <span>📅 ${formatDate(w.date)}</span>
          <span>🕐 ${formatTime(w.time_start)} – ${formatTime(w.time_end)}</span>
          <span>📍 ${w.location || ''}</span>
          <span>👩‍🏫 ${w.instructor || ''}</span>
        </div>
        <div class="detail-price-row">
          <span class="detail-price">${formatPrice(w.price)}</span>
          <span class="detail-seats">${left} seat${left !== 1 ? 's' : ''} available</span>
        </div>
      </div>
    </div>

    <div class="detail-body">
      <div class="detail-main">
        <div class="detail-notebook-card">
          <div class="detail-card-label">About this workshop</div>
          <p>${w.description || ''}</p>
        </div>
        <div class="detail-notebook-card">
          <div class="detail-card-label">What you'll make ✦</div>
          <p class="detail-make">${w.what_youll_make || ''}</p>
        </div>
        <div class="detail-two-col">
          <div class="detail-notebook-card">
            <div class="detail-card-label">🎁 Materials included</div>
            <ul class="detail-list">${materials.map(m => `<li>${m}</li>`).join('')}</ul>
          </div>
          <div class="detail-notebook-card">
            <div class="detail-card-label">🎒 What to bring</div>
            <ul class="detail-list">${bring.map(b => `<li>${b}</li>`).join('')}</ul>
          </div>
        </div>
        ${schedule.length ? `
        <div class="detail-notebook-card">
          <div class="detail-card-label">🗓 Schedule</div>
          <div class="schedule-timeline">
            ${schedule.map(s => `<div class="schedule-item"><div class="schedule-time">${s.time}</div><div class="schedule-dot"></div><div class="schedule-activity">${s.activity}</div></div>`).join('')}
          </div>
        </div>` : ''}
        ${faqs.length ? `
        <div class="detail-notebook-card">
          <div class="detail-card-label">💬 Frequently Asked Questions</div>
          <div class="faq-list">
            ${faqs.map(f => `<details class="faq-item"><summary class="faq-q">${f.q}</summary><p class="faq-a">${f.a}</p></details>`).join('')}
          </div>
        </div>` : ''}
      </div>

      <div class="detail-sidebar">
        <div class="detail-register-card">
          <div class="detail-register-emoji">${w.emoji || '✿'}</div>
          <h3>${w.title}</h3>
          <p class="detail-reg-date">📅 ${formatDate(w.date)}</p>
          <p class="detail-reg-deadline">Register by ${formatDate(w.deadline)}</p>
          <div class="seats-bar" style="margin:12px 0">
            <div class="seats-fill" style="width:${Math.min(100,((w.seats_taken||0)/(w.seats_total||1))*100)}%"></div>
          </div>
          <p class="seats-label">${left} / ${w.seats_total} seats available</p>
          <div class="detail-price-big">${formatPrice(w.price)}</div>
          <button class="btn btn-primary btn-lg detail-reg-btn" id="detail-reg-btn" ${left===0?'disabled':''}>
            ${left===0 ? 'Fully Booked' : 'Register Now ✦'}
          </button>
          <p class="detail-reg-sub">Your CACTUS character will come with you ✿</p>
        </div>
        <div class="detail-char-companion">
          <p class="companion-label">Your companion</p>
          <div id="detail-companion-char"></div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('detail-companion-char')?.appendChild(makeCharPreview(state, 'sm'));
  document.getElementById('detail-reg-btn')?.addEventListener('click', () => {
    if (left > 0) navigateTo('register', { workshopId: w.id });
  });
}

/* ─────────────────────────────────────────────────────────
   11. MULTI-STEP REGISTRATION
   ───────────────────────────────────────────────────────── */
function initRegistration(workshopId) {
  regState.step = 1;
  regState.workshopId = workshopId;

  document.getElementById('reg-back')?.addEventListener('click', () => {
    navigateTo('workshop-detail', { workshopId });
  }, { once: true });

  if (!regState.workshop || regState.workshop.id !== workshopId) {
    supabase.from('workshops').select('*').eq('id', workshopId).maybeSingle().then(({ data, error }) => {
      logSupabaseError('initRegistration', error);
      regState.workshop = data;
      renderRegStep(1);
    });
  } else {
    renderRegStep(1);
  }
}

function updateProgressUI(step) {
  document.querySelectorAll('.reg-step').forEach(el => {
    const s = parseInt(el.dataset.step, 10);
    el.classList.toggle('active',    s === step);
    el.classList.toggle('completed', s < step);
  });
}

function showFormError(containerEl, msg) {
  let err = containerEl.querySelector('.form-error-msg');
  if (!err) {
    err = document.createElement('p');
    err.className = 'form-error-msg';
    containerEl.appendChild(err);
  }
  err.textContent = msg;
  err.style.display = 'block';
}

function renderRegStep(step) {
  regState.step = step;
  updateProgressUI(step);
  const content = document.getElementById('reg-content');
  if (!content) return;

  if (step === 1) {
    const fd = regState.formData;
    content.innerHTML = `
      <div class="reg-card">
        <div class="reg-card-tape"></div>
        <h3 class="reg-card-title">Tell us about yourself ✿</h3>
        <p class="reg-card-sub">All fields marked * are required.</p>
        <form id="reg-form-1" class="reg-form" novalidate>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Full Name *</label>
              <input class="form-input" name="full_name" type="text" placeholder="Your full name" value="${escHtml(fd.full_name)}" required />
            </div>
            <div class="form-group">
              <label class="form-label">Nickname <span class="form-opt">(optional)</span></label>
              <input class="form-input" name="nickname" type="text" placeholder="What do friends call you?" value="${escHtml(fd.nickname)}" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Phone Number *</label>
              <input class="form-input" name="phone" type="tel" placeholder="08xx-xxxx-xxxx" value="${escHtml(fd.phone)}" required />
            </div>
            <div class="form-group">
              <label class="form-label">Email *</label>
              <input class="form-input" name="email" type="email" placeholder="your@email.com" value="${escHtml(fd.email)}" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">University / School *</label>
              <input class="form-input" name="university" type="text" placeholder="Your institution" value="${escHtml(fd.university)}" required />
            </div>
            <div class="form-group">
              <label class="form-label">Faculty / Major *</label>
              <input class="form-input" name="faculty" type="text" placeholder="e.g. Visual Communication Design" value="${escHtml(fd.faculty)}" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Student ID <span class="form-opt">(optional)</span></label>
              <input class="form-input" name="student_id" type="text" placeholder="Your student ID number" value="${escHtml(fd.student_id)}" />
            </div>
            <div class="form-group">
              <label class="form-label">Emergency Contact *</label>
              <input class="form-input" name="emergency_contact" type="text" placeholder="Name &amp; phone (e.g. Mama — 0812…)" value="${escHtml(fd.emergency_contact)}" required />
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary btn-lg">Next: Your Character →</button>
          </div>
        </form>
      </div>
    `;
    document.getElementById('reg-form-1')?.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const required = ['full_name','phone','email','university','faculty','emergency_contact'];
      if (required.some(f => !fd.get(f)?.trim())) { showFormError(e.target,'Please fill in all required fields.'); return; }
      required.concat(['nickname','student_id']).forEach(k => {
        regState.formData[k] = fd.get(k)?.trim() || '';
      });
      renderRegStep(2);
    });
  }

  if (step === 2) {
    const w  = regState.workshop;
    const fd = regState.formData;
    content.innerHTML = `
      <div class="reg-step2-layout">
        <div class="reg-card reg-char-card">
          <div class="reg-card-tape" style="background:linear-gradient(90deg,var(--sage-l),var(--mint))"></div>
          <h3 class="reg-card-title">Your CACTUS Character ✦</h3>
          <p class="reg-card-sub">This character will be your identity at the workshop.</p>
          <div class="reg-char-preview" id="reg-char-preview"></div>
          <div class="form-group" style="margin-top:16px">
            <label class="form-label">Character Name *</label>
            <input class="form-input" id="char-name-input" type="text" placeholder="Give your character a name!" value="${escHtml(fd.character_name)}" maxlength="30" />
            <p class="form-hint">This name will appear on your ticket.</p>
          </div>
          <a href="#" class="reg-edit-char" data-nav="home" data-scroll="create">✏️ Edit character first</a>
        </div>
        <div class="reg-card">
          <div class="reg-card-tape" style="background:linear-gradient(90deg,var(--pink),var(--peach))"></div>
          <h3 class="reg-card-title">Workshop Details ✿</h3>
          ${w ? `<div class="reg-workshop-summary">
            <span class="reg-ws-emoji">${w.emoji || '✿'}</span>
            <div>
              <div class="reg-ws-title">${w.title}</div>
              <div class="reg-ws-date">📅 ${formatDate(w.date)}</div>
              <div class="reg-ws-loc">📍 ${w.location || ''}</div>
            </div>
          </div>` : ''}
          <form id="reg-form-2" class="reg-form" novalidate>
            <div class="form-group">
              <label class="form-label">Special Notes <span class="form-opt">(optional)</span></label>
              <textarea class="form-input form-textarea" name="special_notes" placeholder="Anything we should know?">${escHtml(fd.special_notes)}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Dietary Restrictions <span class="form-opt">(optional)</span></label>
              <input class="form-input" name="dietary" type="text" placeholder="e.g. vegetarian, no nuts" value="${escHtml(fd.dietary)}" />
            </div>
            <div class="form-group">
              <label class="form-label">Accessibility Requests <span class="form-opt">(optional)</span></label>
              <input class="form-input" name="accessibility" type="text" placeholder="e.g. wheelchair access" value="${escHtml(fd.accessibility)}" />
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-soft" id="step2-back">← Back</button>
              <button type="submit" class="btn btn-primary btn-lg">Next: Review →</button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.getElementById('reg-char-preview')?.appendChild(makeCharPreview(state, 'md'));
    document.getElementById('step2-back')?.addEventListener('click', () => renderRegStep(1));
    document.getElementById('reg-form-2')?.addEventListener('submit', e => {
      e.preventDefault();
      const charName = document.getElementById('char-name-input')?.value.trim();
      if (!charName) { showFormError(e.target,'Please give your character a name!'); return; }
      const fd2 = new FormData(e.target);
      regState.formData.character_name = charName;
      regState.formData.special_notes  = fd2.get('special_notes')?.trim()  || '';
      regState.formData.dietary        = fd2.get('dietary')?.trim()        || '';
      regState.formData.accessibility  = fd2.get('accessibility')?.trim()  || '';
      renderRegStep(3);
    });
  }

  if (step === 3) {
    const w  = regState.workshop;
    const fd = regState.formData;
    content.innerHTML = `
      <div class="reg-review">
        <div class="reg-card">
          <div class="reg-card-tape" style="background:linear-gradient(90deg,var(--honey),var(--peach))"></div>
          <h3 class="reg-card-title">Review your registration ✦</h3>
          <p class="reg-card-sub">Everything look good? Confirm to proceed to payment.</p>
          <div class="review-sections">
            <div class="review-section">
              <div class="review-section-title">Personal Info</div>
              <div class="review-grid">
                <span class="rv-label">Full Name</span><span class="rv-val">${escHtml(fd.full_name)}</span>
                ${fd.nickname ? `<span class="rv-label">Nickname</span><span class="rv-val">${escHtml(fd.nickname)}</span>` : ''}
                <span class="rv-label">Phone</span><span class="rv-val">${escHtml(fd.phone)}</span>
                <span class="rv-label">Email</span><span class="rv-val">${escHtml(fd.email)}</span>
                <span class="rv-label">University</span><span class="rv-val">${escHtml(fd.university)}</span>
                <span class="rv-label">Faculty</span><span class="rv-val">${escHtml(fd.faculty)}</span>
                ${fd.student_id ? `<span class="rv-label">Student ID</span><span class="rv-val">${escHtml(fd.student_id)}</span>` : ''}
                <span class="rv-label">Emergency</span><span class="rv-val">${escHtml(fd.emergency_contact)}</span>
              </div>
            </div>
            ${w ? `<div class="review-section">
              <div class="review-section-title">Workshop</div>
              <div class="review-grid">
                <span class="rv-label">Workshop</span><span class="rv-val">${escHtml(w.title)}</span>
                <span class="rv-label">Date</span><span class="rv-val">${formatDate(w.date)}</span>
                <span class="rv-label">Time</span><span class="rv-val">${formatTime(w.time_start)} – ${formatTime(w.time_end)}</span>
                <span class="rv-label">Location</span><span class="rv-val">${escHtml(w.location || '')}</span>
                <span class="rv-label">Price</span><span class="rv-val">${formatPrice(w.price)}</span>
              </div>
            </div>` : ''}
            <div class="review-section review-char-section">
              <div class="review-section-title">Your Character</div>
              <div id="review-char-preview" class="review-char-row"></div>
              <div class="review-char-name">${escHtml(fd.character_name)}</div>
            </div>
            ${fd.special_notes || fd.dietary || fd.accessibility ? `<div class="review-section">
              <div class="review-section-title">Additional Notes</div>
              <div class="review-grid">
                ${fd.special_notes  ? `<span class="rv-label">Notes</span><span class="rv-val">${escHtml(fd.special_notes)}</span>` : ''}
                ${fd.dietary        ? `<span class="rv-label">Dietary</span><span class="rv-val">${escHtml(fd.dietary)}</span>` : ''}
                ${fd.accessibility  ? `<span class="rv-label">Accessibility</span><span class="rv-val">${escHtml(fd.accessibility)}</span>` : ''}
              </div>
            </div>` : ''}
          </div>
          <div class="form-actions">
            <button class="btn btn-soft" id="step3-back">← Edit</button>
            <button class="btn btn-primary btn-lg" id="btn-submit-reg">Confirm Registration ✦</button>
          </div>
          <p class="form-error-msg" id="reg-submit-error" style="display:none"></p>
        </div>
      </div>
    `;
    document.getElementById('review-char-preview')?.appendChild(makeCharPreview(state, 'sm'));
    document.getElementById('step3-back')?.addEventListener('click', () => renderRegStep(2));
    document.getElementById('btn-submit-reg')?.addEventListener('click', submitRegistration);
  }
}

async function submitRegistration() {
  const btn   = document.getElementById('btn-submit-reg');
  const errEl = document.getElementById('reg-submit-error');
  if (errEl) errEl.style.display = 'none';
  if (btn) { btn.textContent = 'Saving…'; btn.disabled = true; }

  if (!regState.workshopId) {
    if (errEl) { errEl.textContent = 'No workshop selected. Please go back and pick a workshop.'; errEl.style.display = 'block'; }
    if (btn)   { btn.textContent = 'Confirm Registration ✦'; btn.disabled = false; }
    return;
  }

  const year    = new Date().getFullYear();
  const randNum = String(Math.floor(Math.random() * 9000) + 1000);
  const regNum  = `CAC-${year}-${randNum}`;
  const seatNum = (regState.workshop?.seats_taken || 0) + 1;

  const payload = {
    registration_number: regNum,
    workshop_id:         regState.workshopId,
    full_name:           regState.formData.full_name,
    nickname:            regState.formData.nickname          || null,
    phone:               regState.formData.phone,
    email:               regState.formData.email,
    university:          regState.formData.university        || null,
    faculty:             regState.formData.faculty           || null,
    student_id:          regState.formData.student_id        || null,
    emergency_contact:   regState.formData.emergency_contact,
    special_notes:       regState.formData.special_notes     || null,
    dietary:             regState.formData.dietary           || null,
    accessibility:       regState.formData.accessibility     || null,
    character_name:      regState.formData.character_name,
    character_state:     state,
    status:              'pending',
    seat_number:         seatNum,
  };

  let insertResult;
  try {
    insertResult = await supabase.from('registrations').insert(payload).select().maybeSingle();
  } catch (networkErr) {
    console.error('[CACTUS] Network/throw error while inserting registration:', networkErr);
    if (errEl) { errEl.textContent = 'Could not reach Supabase. Check your internet connection and try again.'; errEl.style.display = 'block'; }
    if (btn)   { btn.textContent = 'Confirm Registration ✦'; btn.disabled = false; }
    return;
  }

  const { data, error } = insertResult;

  if (error || !data) {
    logSupabaseError('submitRegistration', error);
    if (errEl) {
      errEl.textContent = friendlyError(error, 'Registration failed. Please try again.');
      errEl.style.display = 'block';
    }
    if (btn)   { btn.textContent = 'Confirm Registration ✦'; btn.disabled = false; }
    return;
  }

  const { error: seatError } = await supabase.from('workshops').update({ seats_taken: seatNum }).eq('id', regState.workshopId);
  logSupabaseError('submitRegistration:updateSeats', seatError);
  // Note: we intentionally don't block navigation if only the seat-count
  // update fails — the registration itself already succeeded.

  regState.registrationId     = data.id;
  regState.registrationNumber = data.registration_number;
  regState.seatNumber         = data.seat_number;

  addMyRegistration({
    id:     data.id,
    number: data.registration_number,
    name:   regState.workshop?.title || 'Workshop',
    date:   regState.workshop?.date  || '',
  });

  navigateTo('payment');
}

/* ─────────────────────────────────────────────────────────
   12. PAYMENT PAGE
   ───────────────────────────────────────────────────────── */
function renderPaymentPage() {
  const content = document.getElementById('payment-content');
  if (!content) return;
  const w     = regState.workshop;
  const fd    = regState.formData;
  const price = w?.price || 0;

  content.innerHTML = `
    <div class="pay-header">
      <h2 class="subpage-title">Payment ✦</h2>
      <p class="subpage-desc">You're almost there! Complete your payment to secure your spot.</p>
      <div class="pay-reg-badge"><span>Registration No.</span><strong>${regState.registrationNumber || '—'}</strong></div>
    </div>
    <div class="pay-layout">
      <div class="pay-methods">
        <div class="pay-card">
          <div class="pay-card-tape"></div>
          <h3 class="pay-card-title">Payment Methods</h3>
          <div class="pay-method-tabs">
            <button class="pay-tab active" data-method="bank">🏦 Bank Transfer</button>
            <button class="pay-tab" data-method="qris">📱 QRIS</button>
            <button class="pay-tab" data-method="ewallet">💚 E-Wallet</button>
          </div>
          <div id="pay-method-bank" class="pay-method-detail active">
            <div class="pay-bank-card">
              <div class="pay-bank-name">Bank Mandiri</div>
              <div class="pay-account">1780005846429</div>
              <div class="pay-account-name">a.n. Riefka Berliana Khoi</div>
            </div>
            <div class="pay-instructions">
              <div class="pay-inst-title">Transfer Instructions</div>
              <ol class="pay-inst-list">
                <li>Open your banking app or go to an ATM</li>
                <li>Transfer exactly <strong>${formatPrice(price)}</strong> to the account above</li>
                <li>Use your name as transfer note: <strong>${escHtml(fd.full_name)}</strong></li>
                <li>Save your transfer receipt / screenshot</li>
                <li>Upload the proof below</li>
              </ol>
            </div>
          </div>
          <div id="pay-method-qris" class="pay-method-detail" style="display:none">
            <div class="pay-qris-box">
              <div class="pay-qris-image">
              <img src="/assets/payment/qris.png" alt="QRIS Payment">
              </div>
              <p class="pay-qris-note"> Scan with any e-wallet or banking app </p>
              <p class="pay-qris-amount">Amount: <strong>${formatPrice(price)}</strong></p>
            </div>
          </div>
          <div id="pay-method-ewallet" class="pay-method-detail" style="display:none">
            <div class="pay-ewallet-list">
              <div class="pay-ewallet-item"><span class="ewallet-icon">💚</span><div><div class="ewallet-name">GoPay</div><div class="ewallet-num">0852-1914-417 (Riefka Berliana)</div></div></div>
              <div class="pay-ewallet-item"><span class="ewallet-icon">🔵</span><div><div class="ewallet-name">OVO</div><div class="ewallet-num">0852-1914-4179 (Riefka Berliana)</div></div></div>
              <div class="pay-ewallet-item"><span class="ewallet-icon">🟠</span><div><div class="ewallet-name">Dana</div><div class="ewallet-num">0852-1914-4179 (Riefka Berliana)</div></div></div>
            </div>
            <p class="pay-ewallet-note">Transfer exactly <strong>${formatPrice(price)}</strong> and include your name in the notes.</p>
          </div>
          <div class="pay-deadline">
            <span>⏰</span>
            <div>
              <div class="pay-deadline-label">Payment Deadline</div>
              <div class="pay-deadline-val">${w ? formatDate(w.deadline) : '—'}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="pay-upload-col">
        <div class="pay-card pay-upload-card">
          <div class="pay-card-tape" style="background:linear-gradient(90deg,var(--pink),var(--peach))"></div>
          <h3 class="pay-card-title">Upload Proof ✿</h3>
          <p class="pay-card-sub">Attach your payment receipt like a sticker in your journal.</p>
          <div class="pay-upload-box" id="pay-upload-box">
            <input type="file" id="pay-file-input" accept="image/*" class="pay-file-hidden" />
            <div class="pay-upload-prompt" id="pay-upload-prompt">
              <div class="pay-upload-icon">📎</div>
              <p>Click or drag your receipt here</p>
              <span>JPG or PNG</span>
              <button class="btn btn-soft" type="button" onclick="document.getElementById('pay-file-input').click()">Choose File</button>
            </div>
            <div class="pay-preview-wrap" id="pay-preview-wrap" style="display:none">
              <img id="pay-preview-img" class="pay-preview-img" src="" alt="Payment proof" />
              <button class="btn btn-soft pay-change-btn" type="button" onclick="document.getElementById('pay-file-input').click()">Change File</button>
            </div>
          </div>
          <div class="pay-amount-display">
            <span class="pay-amount-label">Amount to transfer</span>
            <span class="pay-amount-val">${formatPrice(price)}</span>
          </div>
          <p class="form-error-msg" id="pay-submit-error" style="display:none"></p>
          <button class="btn btn-primary btn-lg" id="btn-pay-submit">Submit Payment ✦</button>
          <p class="pay-submit-note">Your ticket will be ready after verification (1×24 hours).</p>
        </div>
        <div class="pay-char-side">
          <p class="companion-label">Your companion is waiting!</p>
          <div id="pay-char-preview"></div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('pay-char-preview')?.appendChild(makeCharPreview(state, 'sm'));

  document.querySelectorAll('.pay-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.pay-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.pay-method-detail').forEach(d => { d.style.display = 'none'; d.classList.remove('active'); });
      tab.classList.add('active');
      const m = document.getElementById(`pay-method-${tab.dataset.method}`);
      if (m) { m.style.display = ''; m.classList.add('active'); }
    });
  });

  let proofDataUrl = null;
  document.getElementById('pay-file-input')?.addEventListener('change', e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      proofDataUrl = ev.target.result;
      document.getElementById('pay-upload-prompt').style.display = 'none';
      document.getElementById('pay-preview-wrap').style.display  = 'block';
      document.getElementById('pay-preview-img').src = proofDataUrl;
    };
    reader.readAsDataURL(file);
  });

  const uploadBox = document.getElementById('pay-upload-box');
  uploadBox?.addEventListener('dragover', e => { e.preventDefault(); uploadBox.classList.add('drag-over'); });
  uploadBox?.addEventListener('dragleave', () => uploadBox.classList.remove('drag-over'));
  uploadBox?.addEventListener('drop', e => {
    e.preventDefault();
    uploadBox.classList.remove('drag-over');
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const dt   = new DataTransfer();
    dt.items.add(file);
    const inp  = document.getElementById('pay-file-input');
    inp.files  = dt.files;
    inp.dispatchEvent(new Event('change'));
  });

  document.getElementById('btn-pay-submit')?.addEventListener('click', async () => {
    const errEl  = document.getElementById('pay-submit-error');
    if (!proofDataUrl) {
      if (errEl) { errEl.textContent = 'Please upload your payment proof first.'; errEl.style.display = 'block'; }
      return;
    }
    const method = document.querySelector('.pay-tab.active')?.dataset.method || 'bank';
    await submitPayment({ method, proofDataUrl });
  });
}

async function submitPayment({ method, proofDataUrl }) {
  const btn   = document.getElementById('btn-pay-submit');
  const errEl = document.getElementById('pay-submit-error');
  if (errEl) errEl.style.display = 'none';
  if (btn) { btn.textContent = 'Submitting…'; btn.disabled = true; }

  if (!regState.registrationId) {
    if (errEl) { errEl.textContent = 'Missing registration reference. Please register again.'; errEl.style.display = 'block'; }
    if (btn)   { btn.textContent = 'Submit Payment ✦'; btn.disabled = false; }
    return;
  }

  let error;
  try {
    ({ error } = await supabase.from('payments').insert({
      registration_id: regState.registrationId,
      method,
      amount:          regState.workshop?.price || 0,
      proof_data:      proofDataUrl,
      status:          'waiting',
    }));
  } catch (networkErr) {
    console.error('[CACTUS] Network/throw error while inserting payment:', networkErr);
    if (errEl) { errEl.textContent = 'Could not reach Supabase. Check your internet connection and try again.'; errEl.style.display = 'block'; }
    if (btn)   { btn.textContent = 'Submit Payment ✦'; btn.disabled = false; }
    return;
  }

  if (error) {
    logSupabaseError('submitPayment', error);
    if (errEl) { errEl.textContent = friendlyError(error, 'Could not submit payment. Please try again.'); errEl.style.display = 'block'; }
    if (btn)   { btn.textContent = 'Submit Payment ✦'; btn.disabled = false; }
    return;
  }
  navigateTo('confirmation', { registrationId: regState.registrationId });
}

/* ─────────────────────────────────────────────────────────
   13. CONFIRMATION / PARTICIPANT PASS
   ───────────────────────────────────────────────────────── */
async function renderConfirmation(regId) {
  const content = document.getElementById('confirmation-content');
  if (!content) return;
  content.innerHTML = `<div class="workshops-loading"><span class="loading-spinner"></span><p>Preparing your pass…</p></div>`;

  const { data: reg, error } = await supabase
    .from('registrations')
    .select('*, workshops(*)')
    .eq('id', regId)
    .maybeSingle();

  if (error || !reg) {
    logSupabaseError('renderConfirmation', error);
    content.innerHTML = `<p class="error-msg">Could not load your confirmation. Try checking My Workshop.${error ? `<br><small>${escHtml(friendlyError(error, ''))}</small>` : ''}</p>`;
    return;
  }

  const w = reg.workshops;
  const qrPayload = JSON.stringify({
    id:    reg.id,
    num:   reg.registration_number,
    name:  reg.full_name,
    ws:    w?.id || '',
    char:  reg.character_name || '',
    seat:  reg.seat_number,
  });

  let qrDataUrl = '';
  try {
    qrDataUrl = await QRCode.toDataURL(qrPayload, {
      width: 160, margin: 1,
      color: { dark: '#5a3e2b', light: '#fdf8ef' },
    });
  } catch { /* QR generation optional */ }

  content.innerHTML = `
    <div class="conf-wrap">
      <div class="conf-celebration">
        <h2 class="conf-title">You're registered! ✦</h2>
        <p class="conf-subtitle">Your adventure begins now. See you at the workshop, ${escHtml(reg.full_name)}!</p>
      </div>

      <div class="ticket" id="conf-ticket">
        <div class="ticket-left">
          <div class="ticket-char-frame">
            <div id="ticket-char"></div>
          </div>
          <div class="ticket-char-name">${escHtml(reg.character_name || 'My Character')}</div>
          <div class="ticket-org">CACTUS Workshop</div>
          <div class="ticket-stamp">REGISTERED</div>
        </div>

        <div class="ticket-perforated-divider">
          <div class="ticket-circle top"></div>
          <div class="ticket-dashes"></div>
          <div class="ticket-circle bottom"></div>
        </div>

        <div class="ticket-right">
          <div class="ticket-event-name">${escHtml(w?.title || 'Workshop')}</div>
          <div class="ticket-theme">${escHtml(w?.theme || '')}</div>
          <div class="ticket-detail-grid">
            <div class="ticket-detail"><span class="td-label">📅 Date</span><span class="td-val">${w ? formatDate(w.date) : '—'}</span></div>
            <div class="ticket-detail"><span class="td-label">🕐 Time</span><span class="td-val">${w ? `${formatTime(w.time_start)} – ${formatTime(w.time_end)}` : '—'}</span></div>
            <div class="ticket-detail"><span class="td-label">📍 Location</span><span class="td-val">${escHtml(w?.location || '—')}</span></div>
            <div class="ticket-detail"><span class="td-label">👤 Participant</span><span class="td-val">${escHtml(reg.full_name)}</span></div>
            <div class="ticket-detail"><span class="td-label">💺 Seat</span><span class="td-val">#${String(reg.seat_number || 0).padStart(2,'0')}</span></div>
            <div class="ticket-detail"><span class="td-label">🎫 Reg. No.</span><span class="td-val ticket-reg-num">${escHtml(reg.registration_number)}</span></div>
          </div>
          <div class="ticket-status-row">
            <span class="ticket-status waiting">⏳ Awaiting Payment Verification</span>
          </div>
          <div class="ticket-qr-wrap">
            ${qrDataUrl
              ? `<img class="ticket-qr" src="${qrDataUrl}" alt="QR Code" />`
              : `<div class="ticket-qr-placeholder">QR</div>`}
            <p class="ticket-qr-hint">Show this at check-in</p>
          </div>
        </div>
        <div class="ticket-stickers">
          <span class="ticket-sticker ts-1">✿</span>
          <span class="ticket-sticker ts-2">✦</span>
          <span class="ticket-sticker ts-3">❤</span>
        </div>
      </div>

      <div class="conf-actions">
        <button class="btn btn-primary btn-lg" id="btn-view-dashboard">Open My Workshop</button>
        <button class="btn btn-soft" id="btn-go-home" data-nav="home">Back to Home</button>
      </div>

      <div class="conf-next-steps">
        <h3>What happens next?</h3>
        <div class="next-steps-grid">
          <div class="next-step-card"><span>1</span><p>Our team verifies your payment within 1×24 hours</p></div>
          <div class="next-step-card"><span>2</span><p>You'll receive a confirmation email with your final ticket</p></div>
          <div class="next-step-card"><span>3</span><p>Show your QR code at the workshop entrance on the big day!</p></div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('ticket-char')?.appendChild(makeCharPreview(reg.character_state || state, 'sm'));
  document.getElementById('btn-view-dashboard')?.addEventListener('click', () => navigateTo('dashboard'));
}

/* ─────────────────────────────────────────────────────────
   14. DASHBOARD — My Workshop
   ───────────────────────────────────────────────────────── */
async function renderDashboard() {
  const content = document.getElementById('dashboard-content');
  if (!content) return;
  const myRegs = getMyRegistrations();

  if (!myRegs.length) {
    content.innerHTML = `
      <div class="dashboard-empty">
        <div id="dash-empty-char"></div>
        <h3>No workshops yet!</h3>
        <p>Your character is ready — find an adventure to join.</p>
        <a href="#" class="btn btn-primary btn-lg" data-nav="workshops">Browse Workshops ✦</a>
      </div>
    `;
    document.getElementById('dash-empty-char')?.appendChild(makeCharPreview(state, 'md'));
    return;
  }

  content.innerHTML = `<div class="workshops-loading"><span class="loading-spinner"></span><p>Loading your diary…</p></div>`;

  const ids = myRegs.map(r => r.id);
  const { data: regs, error } = await supabase
    .from('registrations')
    .select('*, workshops(*)')
    .in('id', ids)
    .order('created_at', { ascending: false });

  if (error || !regs?.length) {
    logSupabaseError('renderDashboard', error);
    content.innerHTML = `<p class="error-msg">Could not load your registrations.${error ? `<br><small>${escHtml(friendlyError(error, ''))}</small>` : ''}</p>`;
    return;
  }

  const { data: payments, error: payErr } = await supabase.from('payments').select('*').in('registration_id', ids);
  logSupabaseError('renderDashboard:payments', payErr);
  const payMap = {};
  (payments || []).forEach(p => { payMap[p.registration_id] = p; });

  content.innerHTML = `<div class="dashboard-grid">${regs.map(reg => renderDashCard(reg, payMap[reg.id])).join('')}</div>`;

  regs.forEach(reg => {
    const el = document.getElementById(`dash-char-${reg.id}`);
    if (el) el.appendChild(makeCharPreview(reg.character_state || state, 'sm'));
  });

  regs.forEach(reg => {
    if (!reg.workshops?.date) return;
    const el = document.getElementById(`countdown-${reg.id}`);
    if (!el) return;
    const target = new Date(`${reg.workshops.date}T${reg.workshops.time_start || '08:00'}:00`);
    updateCountdown(el, target);
    setInterval(() => updateCountdown(el, target), 60000);
  });

  regs.forEach(async reg => {
    const qrEl = document.getElementById(`dash-qr-${reg.id}`);
    if (!qrEl) return;
    try {
      const url = await QRCode.toDataURL(
        JSON.stringify({ id: reg.id, num: reg.registration_number, name: reg.full_name }),
        { width: 120, margin: 1, color: { dark: '#5a3e2b', light: '#fdf8ef' } }
      );
      qrEl.src = url;
    } catch {}
  });

  document.querySelectorAll('[data-view-ticket]').forEach(btn => {
    btn.addEventListener('click', () => {
      regState.registrationId = btn.dataset.viewTicket;
      navigateTo('confirmation', { registrationId: btn.dataset.viewTicket });
    });
  });
}

function renderDashCard(reg, payment) {
  const w         = reg.workshops;
  const payStatus = payment?.status || 'no-payment';
  const regStatus = reg.status;
  const bring     = Array.isArray(w?.what_to_bring) ? w.what_to_bring : [];

  const statusLabel = {
    waiting:    { label: '⏳ Payment Waiting',       cls: 'status-waiting'  },
    verified:   { label: '✅ Payment Verified',      cls: 'status-verified' },
    rejected:   { label: '❌ Payment Rejected',      cls: 'status-rejected' },
    'no-payment':{ label: '📋 No Payment Yet',       cls: 'status-pending'  },
    pending:    { label: '🔄 Pending Confirmation',  cls: 'status-pending'  },
    confirmed:  { label: '✅ Confirmed',             cls: 'status-verified' },
    cancelled:  { label: '❌ Cancelled',             cls: 'status-rejected' },
  };
  const ps = statusLabel[payStatus] || statusLabel['no-payment'];
  const rs = statusLabel[regStatus] || statusLabel['pending'];

  return `
    <div class="dash-card">
      <div class="dash-card-tape" style="background:linear-gradient(90deg,${w?.color||'#c8dbc0'},transparent 80%)"></div>
      <div class="dash-card-top">
        <div class="dash-char-preview" id="dash-char-${reg.id}"></div>
        <div class="dash-card-info">
          <div class="dash-workshop-emoji">${w?.emoji || '✿'}</div>
          <h3 class="dash-workshop-name">${escHtml(w?.title || 'Workshop')}</h3>
          <p class="dash-workshop-date">📅 ${w ? formatDate(w.date) : '—'}</p>
          <p class="dash-workshop-loc">📍 ${escHtml(w?.location || '—')}</p>
          <div class="dash-char-name">${escHtml(reg.character_name || 'My Character')}</div>
        </div>
      </div>
      <div class="dash-status-row">
        <span class="dash-status ${rs.cls}">${rs.label}</span>
        <span class="dash-status ${ps.cls}">${ps.label}</span>
      </div>
      ${w?.date ? `<div class="dash-countdown" id="countdown-${reg.id}">
        <span class="countdown-label">Workshop in</span>
        <span class="countdown-val">…</span>
      </div>` : ''}
      <div class="dash-reg-num">Reg. No: <strong>${escHtml(reg.registration_number)}</strong> · Seat #${String(reg.seat_number||0).padStart(2,'0')}</div>
      ${bring.length ? `<div class="dash-checklist">
        <div class="dash-checklist-title">🎒 Things to bring</div>
        <ul class="dash-checklist-list">${bring.map(b=>`<li><label><input type="checkbox" /> <span>${escHtml(b)}</span></label></li>`).join('')}</ul>
      </div>` : ''}
      <div class="dash-qr-row">
        <div class="dash-qr-wrap">
          <img id="dash-qr-${reg.id}" class="dash-qr" src="" alt="QR Code" />
          <p class="dash-qr-hint">Show at check-in</p>
        </div>
        <div class="dash-card-actions">
          <button class="btn btn-primary" data-view-ticket="${reg.id}">View Ticket</button>
        </div>
      </div>
    </div>
  `;
}

function updateCountdown(el, target) {
  const diff = target - new Date();
  const valEl = el.querySelector('.countdown-val');
  if (!valEl) return;
  if (diff <= 0) { valEl.textContent = 'Today! 🎉'; return; }
  const days  = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  valEl.textContent = days > 0 ? `${days} days ${hours}h` : `${hours} hours`;
}

/* ─────────────────────────────────────────────────────────
   15. SECURITY HELPER
   ───────────────────────────────────────────────────────── */
function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ─────────────────────────────────────────────────────────
   16. INITIALIZE
   ───────────────────────────────────────────────────────── */
renderTabs();
renderOptions();
applyState();
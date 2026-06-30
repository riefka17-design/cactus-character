/* =========================================================
   CACTUS — Character You with Us
   Vanilla JavaScript. No frameworks. No backend.
   ---------------------------------------------------------
   How it works:
   1. CATEGORIES lists every customization category and
      the PNG files available for it.
   2. The avatar is a stack of <img> layers in #preview.
      Each layer has a data-layer attribute.
   3. When a user clicks an option, we only change the
      src of that one layer. We never redraw anything.
   4. Random / Reset / Download work on the same state.
   ---------------------------------------------------------
   To add your own artwork: drop PNGs into the matching
   assets/ folder and add the filename to CATEGORIES below.
   ========================================================= */

'use strict';

/* ---------- 1. Define all categories and their options ----------
   Each entry: { id, label, folder, options: [filename, ...] }
   The first option in each list is the default. */
const CATEGORIES = [
  { id: 'skin', label: 'Skin', folder: 'skin', options: 
  [ { file: 'skin1.png', name: 'Ivory' }, { file: 'skin2.png', name: 'Cream' }, { file: 'skin3.png', name: 'Honey' }, { file: 'skin4.png', name: 'Tan' }, { file: 'skin5.png', name: 'Mocha' }, { file: 'skin6.png', name: 'Avatar' }]},
  { id: 'hair',      label: 'Hair',      folder: 'hair',        options: ['hair1.png','hair2.png','hair3.png','hair4.png','hair5.png'], none: true },
  { id: 'eyes',      label: 'Eyes',      folder: 'eyes',        options: ['eyes1.png','eyes2.png','eyes3.png','eyes4.png'] },
  { id: 'eyebrows',  label: 'Eyebrows',  folder: 'eyebrows',    options: ['brows1.png','brows2.png','brows3.png','brows4.png'] },
  { id: 'mouth',     label: 'Mouth',     folder: 'mouth',       options: ['mouth1.png','mouth2.png','mouth3.png','mouth4.png'] },
  { id: 'blush',     label: 'Blush',     folder: 'blush',        options: ['blush1.png','blush2.png','blush3.png','blush4.png'] },
  { id: 'hijab',     label: 'Hijab',     folder: 'hijab',       options: ['hijab1.png','hijab2.png','hijab3.png','hijab4.png'], none: true },
  { id: 'top',       label: 'Top',       folder: 'tops',        options: ['top1.png','top2.png','top3.png','top4.png'], none: true },
  { id: 'bottom',    label: 'Bottom',    folder: 'bottoms',     options: ['bottom1.png','bottom2.png','bottom3.png'], none: true },
  { id: 'dress',     label: 'Dress',     folder: 'dress',       options: ['dress1.png','dress2.png','dress3.png','dress4.png'], none: true },
  { id: 'accessory', label: 'Accessories', folder: 'accessories', options: ['acc1.png','acc2.png','acc3.png','acc4.png'], none: true },
  { id: 'hobby',     label: 'Hobby',     folder: 'hobbies',     options: ['hobby1.png','hobby2.png','hobby3.png','hobby4.png'], none: true },
  { id: 'background',label: 'Background',folder: 'background',  options: ['bg1.png','bg2.png','bg3.png','bg4.png','bg5.png','bg6.png'] },
];

/* ---------- 2. Current state ----------
   A map of layerId -> chosen filename. Defaults = first option. */
let state = {};
function defaultState() {
  const s = {};
  CATEGORIES.forEach(c => { s[c.id] = c.options[0]; });
  return s;
}
state = defaultState();

/* ---------- 3. DOM references ---------- */
const tabsEl   = document.getElementById('tabs');
const optionsEl= document.getElementById('options');
const previewEl= document.getElementById('preview');
const btnRandom  = document.getElementById('btn-random');
const btnReset   = document.getElementById('btn-reset');
const btnDownload= document.getElementById('btn-download');

let activeCategory = CATEGORIES[0].id;

/* ---------- 4. Build the category tabs ---------- */
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

/* ---------- 5. Build the option buttons for the active category ---------- */
function renderOptions() {
  optionsEl.innerHTML = '';
  const cat = CATEGORIES.find(c => c.id === activeCategory);

  // If this category supports "None", show a None button first.
  if (cat.none) {
    const noneDiv = document.createElement('div');
    noneDiv.className = 'option' + (state[cat.id] === 'none' ? ' active' : '');
    noneDiv.title = 'None';
    noneDiv.innerHTML = '<span class="none-mark">—</span><span class="opt-label">none</span>';
    noneDiv.addEventListener('click', () => {
      state[cat.id] = 'none';
      updateLayer(cat.id, 'none');
      renderOptions();
    });
    optionsEl.appendChild(noneDiv);
  }

  cat.options.forEach(option => {
  const file = option.file;
    const div = document.createElement('div');
    div.className = 'option' + (state[cat.id] === file ? ' active' : '');
    div.title = file;

    const img = document.createElement('img');
    img.src = `assets/${cat.folder}/${file}`;
    img.alt = file;
    div.appendChild(img);

    // small label with the filename (helps when replacing artwork)
    const label = document.createElement('span');
    label.className = 'opt-label';
    label.textContent = option.name;
    div.appendChild(label);

    div.addEventListener('click', () => {
      state[cat.id] = file;       // update state
      updateLayer(cat.id, file);  // swap only this layer's image
      renderOptions();            // refresh active highlight
    });
    optionsEl.appendChild(div);
  });
}

/* ---------- 6. Swap a single layer's image (no redraw) ---------- */
function updateLayer(layerId, file) {
  const cat = CATEGORIES.find(c => c.id === layerId);
  const img = previewEl.querySelector(`[data-layer="${layerId}"]`);
  if (!img || !cat) return;
  if (file === 'none') {
    // Hide the layer entirely when "None" is chosen.
    img.style.display = 'none';
  } else {
    img.style.display = '';
    img.src = `assets/${cat.folder}/${file}`;
  }
}

/* ---------- 7. Apply the full state to the preview ---------- */
function applyState() {
  CATEGORIES.forEach(cat => updateLayer(cat.id, state[cat.id]));
}

/* ---------- 8. Random button ---------- */
btnRandom.addEventListener('click', () => {
  CATEGORIES.forEach(cat => {
    // For categories that support "None", sometimes pick none.
    const pool = cat.none ? [...cat.options, 'none'] : cat.options;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    state[cat.id] = pick;
  });
  applyState();
  renderOptions();
});

/* ---------- 9. Reset button ---------- */
btnReset.addEventListener('click', () => {
  state = defaultState();
  applyState();
  renderOptions();
});

/* ---------- 10. Download as PNG (transparent background) ----------
   We draw every layer onto a canvas at high resolution.
   The background layer is skipped so the export is transparent. */
btnDownload.addEventListener('click', async () => {
  const SIZE = 1024; // high resolution export
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = SIZE;
  const ctx = canvas.getContext('2d');

  // Load all layer images (except background) in order.
  const layerEls = previewEl.querySelectorAll('.layer');
  const order = [];
  layerEls.forEach(el => {
    const layerId = el.dataset.layer;
    if (layerId === 'background') return; // skip for transparency
    if (state[layerId] === 'none') return; // skip hidden layers
    const cat = CATEGORIES.find(c => c.id === layerId);
    if (!cat) return;
    order.push({ src: `assets/${cat.folder}/${state[layerId]}` });
  });

  // Helper: load an image and wait for it.
  function loadImg(src) {
    return new Promise((resolve, reject) => {
      const im = new Image();
      im.crossOrigin = 'anonymous';
      im.onload = () => resolve(im);
      im.onerror = reject;
      im.src = src;
    });
  }

  try {
    for (const item of order) {
      const im = await loadImg(item.src);
      ctx.drawImage(im, 0, 0, SIZE, SIZE);
    }
    // Trigger download.
    const link = document.createElement('a');
    link.download = 'my-cactus-character.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (err) {
    alert('Sorry, could not generate the PNG. Please try again.');
    console.error(err);
  }
});

/* ---------- 11. Initialize ---------- */
renderTabs();
renderOptions();
applyState();

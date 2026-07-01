'use strict';

/* ---------- 1. Categories ---------- */

const CATEGORIES = [
{ id: 'skin', label: 'Skin', folder: 'skin', options: [
{ file: 'skin1.png', name: 'Porcelain' },
{ file: 'skin2.png', name: 'Ivory' },
{ file: 'skin3.png', name: 'Cream' },
{ file: 'skin4.png', name: 'Tan' },
{ file: 'skin5.png', name: 'Mocha' },
{ file: 'skin6.png', name: 'Avatar' }
]},

{ id: 'hair', label: 'Hair', folder: 'hair', options: [
{ file: 'hair1.png', name: 'Pink ' },
{ file: 'hair2.png', name: 'Blonde' },
{ file: 'hair3.png', name: 'Brown' },
{ file: 'hair4.png', name: 'Red' },
{ file: 'hair5.png', name: 'Yellow' },
{ file: 'hair6.png', name: 'Gray' },
{ file: 'hair7.png', name: 'Blue' },
{ file: 'hair8.png', name: 'Red' }
], none: true },

{ id: 'eyes', label: 'Eyes', folder: 'eyes', options: [
{ file: 'eyes1.png', name: 'Eyes 1' },
{ file: 'eyes2.png', name: 'Eyes 2' },
{ file: 'eyes3.png', name: 'Eyes 3' },
{ file: 'eyes4.png', name: 'Eyes 4' },
{ file: 'eyes5.png', name: 'Eyes 1' },
{ file: 'eyes6.png', name: 'Eyes 2' },
{ file: 'eyes7.png', name: 'Eyes 3' },
{ file: 'eyes8.png', name: 'Eyes 4' },
{ file: 'eyes9.png', name: 'Eyes 1' },
{ file: 'eyes10.png', name: 'Eyes 2' },
{ file: 'eyes11.png', name: 'Eyes 3' },
{ file: 'eyes12.png', name: 'Eyes 4' },
{ file: 'eyes13.png', name: 'Eyes 1' },
{ file: 'eyes14.png', name: 'Eyes 2' },
{ file: 'eyes15.png', name: 'Eyes 3' },
{ file: 'eyes16.png', name: 'Eyes 4' },
{ file: 'eyes17.png', name: 'Eyes 4' }
]},

{ id: 'eyebrows', label: 'Eyebrows', folder: 'eyebrows', options: [
{ file: 'brows1.png', name: 'Brows 1' },
{ file: 'brows2.png', name: 'Brows 2' },
{ file: 'brows3.png', name: 'Brows 3' },
{ file: 'brows4.png', name: 'Brows 4' },
{ file: 'brows5.png', name: 'Brows 5' },
{ file: 'brows6.png', name: 'Brows 6' }
]},

{ id: 'mouth', label: 'Mouth', folder: 'mouth', options: [
{ file: 'mouth1.png', name: 'Mouth 1' },
{ file: 'mouth2.png', name: 'Mouth 2' },
{ file: 'mouth3.png', name: 'Mouth 3' },
{ file: 'mouth4.png', name: 'Mouth 4' },
{ file: 'mouth5.png', name: 'Mouth 5' },
{ file: 'mouth6.png', name: 'Mouth 6' }
]},

{ id: 'blush', label: 'Blush', folder: 'blush', options: [
{ file: 'blush1.png', name: 'Blush 1' },
{ file: 'blush2.png', name: 'Blush 2' },
{ file: 'blush3.png', name: 'Blush 3' },
{ file: 'blush4.png', name: 'Blush 4' }
]},

{ id: 'hijab', label: 'Hijab', folder: 'hijab', options: [
{ file: 'hijab1.png', name: 'Hijab 1' },
{ file: 'hijab2.png', name: 'Hijab 2' },
{ file: 'hijab3.png', name: 'Hijab 3' },
{ file: 'hijab4.png', name: 'Hijab 4' }
], none: true },

{ id: 'top', label: 'Top', folder: 'tops', options: [
{ file: 'top1.png', name: 'Top 1' },
{ file: 'top2.png', name: 'Top 2' },
{ file: 'top3.png', name: 'Top 3' },
{ file: 'top4.png', name: 'Top 4' }
], none: true },

{ id: 'bottom', label: 'Bottom', folder: 'bottoms', options: [
{ file: 'bottom1.png', name: 'Bottom 1' },
{ file: 'bottom2.png', name: 'Bottom 2' },
{ file: 'bottom3.png', name: 'Bottom 3' }
], none: true },

{ id: 'dress', label: 'Dress', folder: 'dress', options: [
{ file: 'dress1.png', name: 'Dress 1' },
{ file: 'dress2.png', name: 'Dress 2' },
{ file: 'dress3.png', name: 'Dress 3' },
{ file: 'dress4.png', name: 'Dress 4' }
], none: true },

{ id: 'accessory', label: 'Accessories', folder: 'accessories', options: [
{ file: 'acc1.png', name: 'Acc 1' },
{ file: 'acc2.png', name: 'Acc 2' },
{ file: 'acc3.png', name: 'Acc 3' },
{ file: 'acc4.png', name: 'Acc 4' }
], none: true },

{ id: 'hobby', label: 'Hobby', folder: 'hobbies', options: [
{ file: 'hobby1.png', name: 'Hobby 1' },
{ file: 'hobby2.png', name: 'Hobby 2' },
{ file: 'hobby3.png', name: 'Hobby 3' },
{ file: 'hobby4.png', name: 'Hobby 4' }
], none: true },

{ id: 'background', label: 'Background', folder: 'background', options: [
{ file: 'bg1.png', name: 'BG 1' },
{ file: 'bg2.png', name: 'BG 2' },
{ file: 'bg3.png', name: 'BG 3' },
{ file: 'bg4.png', name: 'BG 4' },
{ file: 'bg5.png', name: 'BG 5' },
{ file: 'bg6.png', name: 'BG 6' }
]}
];

/* ---------- 2. State ---------- */

let state = {};

function defaultState() {
const s = {};
CATEGORIES.forEach(c => {
s[c.id] = c.options[0].file;
});
return s;
}

state = defaultState();

/* ---------- 3. DOM ---------- */

const tabsEl = document.getElementById('tabs');
const optionsEl = document.getElementById('options');
const previewEl = document.getElementById('preview');
const btnRandom = document.getElementById('btn-random');
const btnReset = document.getElementById('btn-reset');
const btnDownload = document.getElementById('btn-download');

let activeCategory = CATEGORIES[0].id;

/* ---------- 4. Tabs ---------- */

function renderTabs() {
tabsEl.innerHTML = '';
CATEGORIES.forEach(cat => {
const btn = document.createElement('button');
btn.className = 'tab' + (cat.id === activeCategory ? ' active' : '');
btn.textContent = cat.label;

btn.onclick = () => {
activeCategory = cat.id;
renderTabs();
renderOptions();
};

tabsEl.appendChild(btn);
});
}

/* ---------- 5. Options ---------- */

function renderOptions() {
optionsEl.innerHTML = '';
const cat = CATEGORIES.find(c => c.id === activeCategory);

if (cat.none) {
const none = document.createElement('div');
none.className = 'option' + (state[cat.id] === 'none' ? ' active' : '');
none.innerHTML = '—none';

none.onclick = () => {
state[cat.id] = 'none';
updateLayer(cat.id, 'none');
renderOptions();
};

optionsEl.appendChild(none);
}

cat.options.forEach(opt => {
const file = opt.file;

const div = document.createElement('div');
div.className = 'option' + (state[cat.id] === file ? ' active' : '');
div.title = opt.name;

const img = document.createElement('img');
img.src = `/assets/${cat.folder}/${file}`;
img.alt = file;

const label = document.createElement('span');
label.className = 'opt-label';
label.textContent = opt.name;

div.appendChild(img);
div.appendChild(label);

div.onclick = () => {
state[cat.id] = file;
updateLayer(cat.id, file);
renderOptions();
};

optionsEl.appendChild(div);
});
}

/* ---------- 6. Update Layer ---------- */

function updateLayer(layerId, file) {
const cat = CATEGORIES.find(c => c.id === layerId);
const img = previewEl.querySelector(`[data-layer="${layerId}"]`);
if (!img || !cat) return;

if (file === 'none') {
img.style.display = 'none';
} else {
img.style.display = '';
img.src = `/assets/${cat.folder}/${file}`;
}
}

/* ---------- 7. Apply State ---------- */

function applyState() {
CATEGORIES.forEach(c => updateLayer(c.id, state[c.id]));
}

/* ---------- 8. Random ---------- */

btnRandom.onclick = () => {
CATEGORIES.forEach(cat => {
const pool = cat.none
? [...cat.options.map(o => o.file), 'none']
: cat.options.map(o => o.file);

state[cat.id] = pool[Math.floor(Math.random() * pool.length)];
});
applyState();
renderOptions();
};

/* ---------- 9. Reset ---------- */

btnReset.onclick = () => {
state = defaultState();
applyState();
renderOptions();
};

/* ---------- 10. Download ---------- */

btnDownload.onclick = async () => {
const SIZE = 1024;
const canvas = document.createElement('canvas');
canvas.width = canvas.height = SIZE;
const ctx = canvas.getContext('2d');

const layerEls = previewEl.querySelectorAll('.layer');
const order = [];

layerEls.forEach(el => {
const id = el.dataset.layer;
if (id === 'background') return;
if (state[id] === 'none') return;

const cat = CATEGORIES.find(c => c.id === id);
order.push(`assets/${cat.folder}/${state[id]}`);
});

function load(src) {
return new Promise(res => {
const img = new Image();
img.onload = () => res(img);
img.src = src;
});
}

for (const src of order) {
const img = await load(src);
ctx.drawImage(img, 0, 0, SIZE, SIZE);
}

const link = document.createElement('a');
link.download = 'my-cactus-character.png';
link.href = canvas.toDataURL('image/png');
link.click();
};

/* ---------- 11. Init ---------- */

renderTabs();
renderOptions();
applyState();
let currentQRText = '';
let currentPNGDataURL = null;
let logoImage = null;
let logoDataURL = null;
let previousErrorLevel = 'M';
let isGenerating = false;
let bulkResults = [];
let autoGenerateTimer = null;

const BULK_MAX = 60;

const TYPE_DESCRIPTIONS = {
  text: 'Encode any plain text — a note, a message, anything.',
  url: 'Redirect to an existing web page.',
  bulk: 'Generate a QR code for each of several URLs at once.',
  email: 'Open a pre-filled email in the scanner’s mail app.',
  phone: 'Dial a number as soon as it’s scanned.',
  sms: 'Open a pre-filled text message, ready to send.',
  wifi: 'Join a WiFi network without typing the password.',
  vcard: 'Share a contact card that saves straight to an address book.'
};

const ICONS = {
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 21h14"/></svg>',
  file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h9l5 5v15H6z"/><path d="M15 2v5h5"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 012-2h10"/></svg>',
  archive: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a1 1 0 001 1h12a1 1 0 001-1V8"/><path d="M10 13h4"/></svg>'
};

const STYLE_PRESETS = [
  { name: 'Classic', fgColor: '#111827', bgColor: '#ffffff', dotStyle: 'square', cornerStyle: 'square', gradientEnabled: false },
  { name: 'Indigo Rounded', fgColor: '#4f46e5', bgColor: '#ffffff', dotStyle: 'rounded', cornerStyle: 'rounded', gradientEnabled: false },
  { name: 'Dots', fgColor: '#111827', bgColor: '#ffffff', dotStyle: 'dots', cornerStyle: 'dot', gradientEnabled: false },
  { name: 'Indigo Gradient', fgColor: '#4f46e5', bgColor: '#ffffff', dotStyle: 'rounded', cornerStyle: 'rounded', gradientEnabled: true, gradientType: 'linear', gradientColor2: '#a855f7' },
  { name: 'Sunset', fgColor: '#f97316', bgColor: '#fff7ed', dotStyle: 'dots', cornerStyle: 'dot', gradientEnabled: true, gradientType: 'radial', gradientColor2: '#ec4899' }
];

document.addEventListener('DOMContentLoaded', () => {
  wireTypePicker();
  wireAdvancedToggles();
  wireLogoInput();
  wireSizeDisplays();
  wireGenerateShortcuts();
  wireAutoUpdate();

  document.getElementById('generateButton').addEventListener('click', () => generate(false));

  document.getElementById('textContent').value = 'Welcome to QR AllWays!';
  generate(false);
});

function scheduleAutoGenerate(delay = 400) {
  clearTimeout(autoGenerateTimer);
  autoGenerateTimer = setTimeout(() => generate(true), delay);
}

function wireAutoUpdate() {
  const builderCard = document.getElementById('builderCard');
  builderCard.addEventListener('input', (e) => {
    if (e.target.matches('input[type="file"]')) return;
    scheduleAutoGenerate();
  });
  builderCard.addEventListener('change', (e) => {
    if (e.target.matches('input[type="file"]')) return;
    scheduleAutoGenerate(100);
  });
}

function wireTypePicker() {
  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.type-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.type-form').forEach(f => f.classList.remove('active'));

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      document.getElementById(`${btn.dataset.type}-form`).classList.add('active');
      document.getElementById('typeDescription').textContent = TYPE_DESCRIPTIONS[btn.dataset.type] || '';
      clearMessages();
      scheduleAutoGenerate(0);
    });
  });
}

function wireAdvancedToggles() {
  const pairs = [
    ['gradientEnabled', 'gradientRow'],
    ['eyeColorEnabled', 'eyeColorRow'],
    ['frameEnabled', 'frameFields']
  ];
  pairs.forEach(([checkboxId, rowId]) => {
    document.getElementById(checkboxId).addEventListener('change', function () {
      document.getElementById(rowId).hidden = !this.checked;
    });
  });
}

function wireSizeDisplays() {
  document.getElementById('sizeRange').addEventListener('input', function () {
    document.getElementById('sizeDisplay').textContent = `${this.value}px`;
  });
  document.getElementById('logoSizeRange').addEventListener('input', function () {
    document.getElementById('logoSizeDisplay').textContent = `${this.value}%`;
  });
}

function updateErrorLevelLock() {
  const errorLevelSelect = document.getElementById('errorLevel');
  const shouldLock = !!logoImage;

  if (shouldLock && !errorLevelSelect.disabled) {
    previousErrorLevel = errorLevelSelect.value;
    errorLevelSelect.value = 'H';
    errorLevelSelect.disabled = true;
  } else if (!shouldLock && errorLevelSelect.disabled) {
    errorLevelSelect.disabled = false;
    errorLevelSelect.value = previousErrorLevel;
  }
}

function wireLogoInput() {
  const input = document.getElementById('logoInput');
  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showMessage('Please choose an image file for the logo.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        logoImage = img;
        logoDataURL = evt.target.result;
        document.getElementById('logoSizeRow').hidden = false;
        document.getElementById('logoHint').hidden = false;
        document.getElementById('removeLogoBtn').hidden = false;
        updateErrorLevelLock();
        scheduleAutoGenerate(0);
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('removeLogoBtn').addEventListener('click', function () {
    logoImage = null;
    logoDataURL = null;
    input.value = '';
    document.getElementById('logoSizeRow').hidden = true;
    document.getElementById('logoHint').hidden = true;
    this.hidden = true;
    updateErrorLevelLock();
    scheduleAutoGenerate(0);
  });
}

function wireGenerateShortcuts() {
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isGenerating) generate(false);
    }
  });
}

function fieldValues() {
  const val = id => document.getElementById(id).value;
  return {
    textContent: val('textContent'),
    urlInput: val('urlInput'),
    emailAddress: val('emailAddress'),
    emailSubject: val('emailSubject'),
    emailBody: val('emailBody'),
    phoneNumber: val('phoneNumber'),
    smsNumber: val('smsNumber'),
    smsMessage: val('smsMessage'),
    wifiSSID: val('wifiSSID'),
    wifiPassword: val('wifiPassword'),
    wifiSecurity: val('wifiSecurity'),
    firstName: val('firstName'),
    lastName: val('lastName'),
    organization: val('organization'),
    vcardPhone: val('vcardPhone'),
    vcardEmail: val('vcardEmail'),
    vcardWebsite: val('vcardWebsite')
  };
}

function collectOptions() {
  const id = x => document.getElementById(x);
  return {
    size: parseInt(id('sizeRange').value, 10),
    errorLevel: logoImage ? 'H' : id('errorLevel').value,
    fgColor: id('foregroundColor').value,
    bgColor: id('backgroundColor').value,
    dotStyle: id('dotStyle').value,
    cornerStyle: id('cornerStyle').value,
    eyeColorEnabled: id('eyeColorEnabled').checked,
    eyeColor: id('eyeColor').value,
    gradientEnabled: id('gradientEnabled').checked,
    gradientType: id('gradientType').value,
    gradientColor2: id('gradientColor2').value,
    logoImage,
    logoDataURL,
    logoSizePercent: parseInt(id('logoSizeRange').value, 10),
    frameEnabled: id('frameEnabled').checked,
    frameText: id('frameText').value.trim() || 'SCAN ME',
    framePosition: id('framePosition').value,
    frameColor: id('frameColor').value,
    frameTextColor: id('frameTextColor').value
  };
}

function generate(auto) {
  if (isGenerating) return;
  isGenerating = true;
  clearMessages();
  resetPreview();

  try {
    const activeType = document.querySelector('.type-btn.active').dataset.type;
    if (activeType === 'bulk') {
      generateBulk(auto);
    } else {
      generateSingle(activeType, auto);
    }
  } catch (err) {
    document.getElementById('qrPlaceholder').hidden = false;
    const isEmptyInput = err.message === 'Please fill in the required fields.' ||
      err.message === 'Enter at least one URL, one per line.';
    if (!(auto && isEmptyInput)) {
      console.error(err);
      showMessage(err.message, 'error');
    }
  } finally {
    isGenerating = false;
  }

  renderPresetStrip();
}

function applyStylePreset(preset) {
  const id = x => document.getElementById(x);
  id('foregroundColor').value = preset.fgColor;
  id('backgroundColor').value = preset.bgColor;
  id('dotStyle').value = preset.dotStyle;
  id('cornerStyle').value = preset.cornerStyle;
  id('eyeColorEnabled').checked = false;
  id('eyeColorRow').hidden = true;
  id('gradientEnabled').checked = preset.gradientEnabled;
  id('gradientRow').hidden = !preset.gradientEnabled;
  if (preset.gradientEnabled) {
    id('gradientType').value = preset.gradientType;
    id('gradientColor2').value = preset.gradientColor2;
  }
  generate(false);
}

function renderPresetStrip() {
  const strip = document.getElementById('presetStrip');
  if (!strip) return;

  const activeType = document.querySelector('.type-btn.active').dataset.type;
  let previewText = 'QR AllWays';
  if (activeType !== 'bulk') {
    try {
      const built = DataBuilders[activeType](fieldValues());
      if (built && built.trim()) previewText = built;
    } catch {
      // fall back to the default preview text
    }
  }

  const baseOpt = collectOptions();
  strip.innerHTML = '';

  STYLE_PRESETS.forEach((preset) => {
    const opt = Object.assign({}, baseOpt, preset, {
      size: 52,
      frameEnabled: false,
      logoImage: null
    });

    const qr = qrcode(0, 'M');
    qr.addData(previewText);
    qr.make();
    const canvas = renderCanvas(qr, opt);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'preset-swatch';
    btn.title = preset.name;
    btn.setAttribute('aria-label', `Apply ${preset.name} style`);
    btn.appendChild(canvas);
    btn.addEventListener('click', () => applyStylePreset(preset));
    strip.appendChild(btn);
  });
}

function resetPreview() {
  document.getElementById('qrcode').innerHTML = '';
  document.getElementById('bulkGrid').hidden = true;
  document.getElementById('bulkGrid').innerHTML = '';
  document.getElementById('qrInfo').hidden = true;
  document.getElementById('actionButtons').hidden = true;
  document.getElementById('qrPlaceholder').hidden = true;
}

function generateSingle(activeType, auto) {
  const text = DataBuilders[activeType](fieldValues());

  if (!text || !text.trim()) {
    throw new Error('Please fill in the required fields.');
  }
  if (text.length > 2953) {
    throw new Error('Data is too long. Please reduce the content size.');
  }

  const opt = collectOptions();
  const qr = qrcode(0, opt.errorLevel);
  qr.addData(text);
  qr.make();

  const canvas = renderCanvas(qr, opt);

  document.getElementById('qrcode').appendChild(canvas);

  currentQRText = text;
  currentPNGDataURL = canvas.toDataURL('image/png', 1.0);

  showInfo(activeType, canvas, text, opt.errorLevel);
  showActions();
  if (!auto) showMessage('QR code generated.', 'success');
}

function sanitizeFilename(url, index) {
  const stripped = url.replace(/^https?:\/\//i, '').replace(/[^a-z0-9.-]+/gi, '-').replace(/^-+|-+$/g, '');
  const base = stripped.slice(0, 60) || `qrcode-${index}`;
  return `${base}.png`;
}

function generateBulk(auto) {
  const lines = document.getElementById('bulkUrls').value
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    throw new Error('Enter at least one URL, one per line.');
  }
  if (lines.length > BULK_MAX) {
    throw new Error(`Please limit a batch to ${BULK_MAX} URLs (you entered ${lines.length}).`);
  }

  const opt = collectOptions();
  const grid = document.getElementById('bulkGrid');
  const usedNames = new Set();
  bulkResults = [];
  let skipped = 0;

  lines.forEach((line, index) => {
    let url;
    try {
      url = normalizeUrl(line);
      new URL(url);
    } catch {
      skipped++;
      return;
    }

    const qr = qrcode(0, opt.errorLevel);
    qr.addData(url);
    qr.make();
    const canvas = renderCanvas(qr, opt);
    const dataURL = canvas.toDataURL('image/png', 1.0);

    let name = sanitizeFilename(url, index);
    while (usedNames.has(name)) name = `${index}-${name}`;
    usedNames.add(name);

    bulkResults.push({ url, name, dataURL });

    const item = document.createElement('div');
    item.className = 'bulk-item';
    item.appendChild(canvas);

    const label = document.createElement('span');
    label.className = 'bulk-label';
    label.textContent = url;
    item.appendChild(label);

    const dlBtn = document.createElement('button');
    dlBtn.type = 'button';
    dlBtn.textContent = 'PNG';
    dlBtn.addEventListener('click', () => downloadDataURL(dataURL, name));
    item.appendChild(dlBtn);

    grid.appendChild(item);
  });

  if (bulkResults.length === 0) {
    throw new Error('None of the lines were valid URLs.');
  }

  grid.hidden = false;

  const info = document.getElementById('qrInfo');
  info.hidden = false;
  info.innerHTML = `
    <dt>Type</dt><dd>Bulk URLs</dd>
    <dt>Generated</dt><dd>${bulkResults.length} of ${lines.length}</dd>
  `;

  const actions = document.getElementById('actionButtons');
  actions.hidden = false;
  actions.innerHTML = `<button type="button" id="downloadZipBtn">${ICONS.archive}Download all (.zip)</button>`;
  document.getElementById('downloadZipBtn').addEventListener('click', downloadBulkZip);

  if (!auto || skipped > 0) {
    const summary = skipped > 0
      ? `${bulkResults.length} QR codes generated — ${skipped} line${skipped === 1 ? '' : 's'} skipped (not a valid URL).`
      : `${bulkResults.length} QR codes generated.`;
    showMessage(summary, 'success');
  }
}

function downloadDataURL(dataURL, filename) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataURL;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function downloadBulkZip() {
  if (bulkResults.length === 0) return;
  try {
    const files = bulkResults.map(r => ({ name: r.name, data: dataURLToBytes(r.dataURL) }));
    const blob = buildZip(files);
    const link = document.createElement('a');
    link.download = `qrcodes-${Date.now()}.zip`;
    link.href = URL.createObjectURL(blob);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    showMessage('ZIP downloaded.', 'success');
  } catch (err) {
    console.error(err);
    showMessage('Failed to build ZIP.', 'error');
  }
}

function showInfo(type, canvas, text, errorLevel) {
  const levelNames = { L: 'Low (~7%)', M: 'Medium (~15%)', Q: 'Quartile (~25%)', H: 'High (~30%)' };
  const info = document.getElementById('qrInfo');
  info.hidden = false;
  info.innerHTML = `
    <dt>Type</dt><dd>${DATA_TYPE_LABELS[type] || type}</dd>
    <dt>Size</dt><dd>${canvas.width}×${canvas.height}px</dd>
    <dt>Length</dt><dd>${text.length} chars</dd>
    <dt>Error correction</dt><dd>${levelNames[errorLevel]}</dd>
  `;
}

function showActions() {
  const actions = document.getElementById('actionButtons');
  actions.hidden = false;
  actions.innerHTML = `
    <button type="button" id="downloadPngBtn">${ICONS.download}Download PNG</button>
    <button type="button" id="downloadSvgBtn">${ICONS.file}Download SVG</button>
    <button type="button" id="copyBtn">${ICONS.copy}Copy image</button>
  `;
  document.getElementById('downloadPngBtn').addEventListener('click', downloadPNG);
  document.getElementById('downloadSvgBtn').addEventListener('click', downloadSVGFile);
  document.getElementById('copyBtn').addEventListener('click', copyToClipboard);
}

function downloadPNG() {
  if (!currentPNGDataURL) return;
  const link = document.createElement('a');
  link.download = `qrcode-${Date.now()}.png`;
  link.href = currentPNGDataURL;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showMessage('PNG downloaded.', 'success');
}

function downloadSVGFile() {
  if (!currentQRText) return;
  try {
    const opt = collectOptions();
    const qr = qrcode(0, opt.errorLevel);
    qr.addData(currentQRText);
    qr.make();

    const svg = renderSVG(qr, opt);
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const link = document.createElement('a');
    link.download = `qrcode-${Date.now()}.svg`;
    link.href = URL.createObjectURL(blob);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    showMessage('SVG downloaded.', 'success');
  } catch (err) {
    console.error(err);
    showMessage('Failed to build SVG.', 'error');
  }
}

async function copyToClipboard() {
  if (!currentPNGDataURL) return;
  try {
    if (navigator.clipboard && window.ClipboardItem) {
      const blob = await (await fetch(currentPNGDataURL)).blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      showMessage('Copied to clipboard.', 'success');
    } else {
      downloadPNG();
      showMessage('Clipboard unsupported — downloaded instead.', 'success');
    }
  } catch (err) {
    console.error(err);
    downloadPNG();
    showMessage('Clipboard unavailable — downloaded instead.', 'success');
  }
}

function showMessage(text, kind) {
  const box = document.getElementById('messages');
  box.innerHTML = `<p class="toast ${kind}">${escapeHtml(text)}</p>`;
  setTimeout(() => { box.innerHTML = ''; }, kind === 'error' ? 5000 : 3000);
}

function clearMessages() {
  document.getElementById('messages').innerHTML = '';
}

import { useEffect, useRef, useState } from 'react';
import qrcodegen from 'qrcode-generator';
import brandLogo from './assets/logo.png';
import TypePicker from './components/TypePicker.jsx';
import ContentForm from './components/ContentForm.jsx';
import CustomizePanel from './components/CustomizePanel.jsx';
import PreviewPanel from './components/PreviewPanel.jsx';
import ScannerPanel from './components/ScannerPanel.jsx';
import { GithubIcon, LinkedInIcon, SunIcon, MoonIcon } from './icons.jsx';
import { DataBuilders, TYPE_DESCRIPTIONS } from './lib/dataBuilders.js';
import { renderCanvas, renderSVG } from './lib/renderer.js';
import { STYLE_PRESETS } from './lib/presets.js';
import { DEFAULT_FIELDS, DEFAULT_OPTS, downloadHref } from './lib/constants.js';

const HISTORY_KEY = 'qrArtHistory';
const THEME_KEY = 'qrArtTheme';
const HISTORY_MAX = 12;

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadInitialTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {
    // localStorage unavailable — fall through to system preference
  }
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function App() {
  const [mode, setMode] = useState('generate');
  const [theme, setTheme] = useState(loadInitialTheme);
  const [activeType, setActiveType] = useState('text');
  const [fields, setFields] = useState(DEFAULT_FIELDS);
  const [opts, setOpts] = useState(DEFAULT_OPTS);
  const [logo, setLogo] = useState({ image: null, dataURL: null, sizePercent: 20 });
  const [errorLevelLocked, setErrorLevelLocked] = useState(false);

  const [currentQRText, setCurrentQRText] = useState('');
  const [currentPNGDataURL, setCurrentPNGDataURL] = useState(null);
  const [info, setInfo] = useState(null);
  const [message, setMessage] = useState(null);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [history, setHistory] = useState(loadHistory);

  const canvasWrapRef = useRef(null);
  const presetStripRef = useRef(null);
  const logoInputRef = useRef(null);
  const autoTimerRef = useRef(null);
  const didMountRef = useRef(false);
  const prevErrorLevelRef = useRef('M');

  // Apply and persist the color theme.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // localStorage unavailable (private mode, disabled storage) — theme still applies for this session
    }
  }, [theme]);

  function toggleTheme() {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }

  function addToHistory(entry) {
    setHistory((h) => {
      const next = [entry, ...h].slice(0, HISTORY_MAX);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      } catch {
        // localStorage unavailable — history just won't persist across reloads
      }
      return next;
    });
  }

  function clearHistory() {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {
      // nothing to clean up if storage was never available
    }
  }

  // Lock error correction to High while a logo is present.
  useEffect(() => {
    if (logo.image && !errorLevelLocked) {
      setOpts((o) => {
        prevErrorLevelRef.current = o.errorLevel;
        return { ...o, errorLevel: 'H' };
      });
      setErrorLevelLocked(true);
    } else if (!logo.image && errorLevelLocked) {
      setOpts((o) => ({ ...o, errorLevel: prevErrorLevelRef.current }));
      setErrorLevelLocked(false);
    }
  }, [logo.image, errorLevelLocked]);

  function buildRenderOptions() {
    return {
      ...opts,
      logoImage: logo.image,
      logoDataURL: logo.dataURL,
      logoSizePercent: logo.sizePercent
    };
  }

  function generateSingle(auto, skipHistory) {
    const text = DataBuilders[activeType](fields);
    if (!text || !text.trim()) throw new Error('Please fill in the required fields.');
    if (text.length > 2953) throw new Error('Data is too long. Please reduce the content size.');

    const renderOpts = buildRenderOptions();
    const qr = qrcodegen(0, renderOpts.errorLevel);
    qr.addData(text);
    qr.make();
    const canvas = renderCanvas(qr, renderOpts);

    if (canvasWrapRef.current) {
      canvasWrapRef.current.innerHTML = '';
      canvasWrapRef.current.appendChild(canvas);
    }

    const dataURL = canvas.toDataURL('image/png', 1.0);
    setCurrentQRText(text);
    setCurrentPNGDataURL(dataURL);
    setInfo({ type: activeType, width: canvas.width, height: canvas.height, length: text.length, errorLevel: renderOpts.errorLevel });
    setShowPlaceholder(false);
    if (!auto) {
      setMessage({ text: 'QR code generated.', kind: 'success' });
      if (!skipHistory) addToHistory({ id: Date.now(), type: activeType, snippet: text.slice(0, 40), dataURL });
    }
  }

  function renderPresetStrip() {
    const strip = presetStripRef.current;
    if (!strip) return;

    let previewText = 'QR Art';
    try {
      const built = DataBuilders[activeType](fields);
      if (built && built.trim()) previewText = built;
    } catch {
      // fall back to the default preview text
    }

    const baseOpts = buildRenderOptions();
    strip.innerHTML = '';

    STYLE_PRESETS.forEach((preset) => {
      const o = { ...baseOpts, ...preset, size: 52, frameEnabled: false, logoImage: null };
      const qr = qrcodegen(0, 'M');
      qr.addData(previewText);
      qr.make();
      const canvas = renderCanvas(qr, o);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'preset-swatch';
      btn.title = preset.name;
      btn.setAttribute('aria-label', `Apply ${preset.name} style`);
      btn.appendChild(canvas);
      btn.addEventListener('click', () => applyPreset(preset));
      strip.appendChild(btn);
    });
  }

  function applyPreset(preset) {
    setOpts((o) => ({
      ...o,
      fgColor: preset.fgColor,
      bgColor: preset.bgColor,
      dotStyle: preset.dotStyle,
      cornerStyle: preset.cornerStyle,
      eyeColorEnabled: false,
      gradientEnabled: preset.gradientEnabled,
      gradientType: preset.gradientType,
      gradientColor2: preset.gradientColor2
    }));
  }

  function generate(auto, skipHistory) {
    setMessage(null);
    if (canvasWrapRef.current) canvasWrapRef.current.innerHTML = '';
    setInfo(null);
    setShowPlaceholder(true);

    try {
      generateSingle(auto, skipHistory);
    } catch (err) {
      setShowPlaceholder(true);
      const isEmptyInput = err.message === 'Please fill in the required fields.';
      if (!(auto && isEmptyInput)) {
        console.error(err);
        setMessage({ text: err.message, kind: 'error' });
      }
    }

    renderPresetStrip();
  }

  // Immediate generation on first mount; debounced auto-regeneration after any change.
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      generate(false, true); // show the initial demo, but don't clutter history with it
      return;
    }
    clearTimeout(autoTimerRef.current);
    autoTimerRef.current = setTimeout(() => generate(true), 300);
    return () => clearTimeout(autoTimerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeType, fields, opts, logo.image, logo.sizePercent]);

  // Auto-dismiss toast messages.
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), message.kind === 'error' ? 5000 : 3000);
    return () => clearTimeout(t);
  }, [message]);

  function updateField(key, value) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  function updateOpt(key, value) {
    setOpts((o) => ({ ...o, [key]: value }));
  }

  function selectType(type) {
    setActiveType(type);
  }

  function handleLogoFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMessage({ text: 'Please choose an image file for the logo.', kind: 'error' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        setLogo((l) => ({ ...l, image: img, dataURL: evt.target.result }));
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  }

  function handleLogoSizeChange(e) {
    setLogo((l) => ({ ...l, sizePercent: parseInt(e.target.value, 10) }));
  }

  function removeLogo() {
    setLogo({ image: null, dataURL: null, sizePercent: 20 });
    if (logoInputRef.current) logoInputRef.current.value = '';
  }

  function downloadPNG() {
    if (!currentPNGDataURL) return;
    downloadHref(currentPNGDataURL, `qrcode-${Date.now()}.png`);
    setMessage({ text: 'PNG downloaded.', kind: 'success' });
  }

  function downloadSVGFile() {
    if (!currentQRText) return;
    try {
      const renderOpts = buildRenderOptions();
      const qr = qrcodegen(0, renderOpts.errorLevel);
      qr.addData(currentQRText);
      qr.make();
      const svg = renderSVG(qr, renderOpts);
      const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      downloadHref(url, `qrcode-${Date.now()}.svg`);
      URL.revokeObjectURL(url);
      setMessage({ text: 'SVG downloaded.', kind: 'success' });
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to build SVG.', kind: 'error' });
    }
  }

  async function copyToClipboard() {
    if (!currentPNGDataURL) return;
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const blob = await (await fetch(currentPNGDataURL)).blob();
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setMessage({ text: 'Copied to clipboard.', kind: 'success' });
      } else {
        downloadPNG();
        setMessage({ text: 'Clipboard unsupported — downloaded instead.', kind: 'success' });
      }
    } catch (err) {
      console.error(err);
      downloadPNG();
      setMessage({ text: 'Clipboard unavailable — downloaded instead.', kind: 'success' });
    }
  }

  return (
    <div className="app">
      <header className="site-header">
        <div className="site-header-inner">
          <div className="brand">
            <img className="brand-mark" src={brandLogo} alt="QR Art logo" />
            <div className="brand-text">
              <h1>QR Art</h1>
              <p>Free custom QR codes in seconds — no sign up, no login</p>
            </div>
          </div>
          <div className="header-right">
            <span className="header-badge">100% free — no login required</span>
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </div>
      </header>

      <div className="mode-bar">
        <div className="mode-bar-inner">
          <button
            type="button"
            className={`mode-btn${mode === 'generate' ? ' active' : ''}`}
            onClick={() => setMode('generate')}
          >
            Generate
          </button>
          <button
            type="button"
            className={`mode-btn${mode === 'scan' ? ' active' : ''}`}
            onClick={() => setMode('scan')}
          >
            Scan
          </button>
        </div>
      </div>

      <main>
        {mode === 'generate' && (
          <>
        <section className="section section-a">
          <div className="section-inner">
            <div className="section-head">
              <div>
                <h2>Choose content</h2>
                <p>Pick what this code should do when scanned.</p>
              </div>
            </div>

            <TypePicker activeType={activeType} onSelect={selectType} />
            <p className="type-description">{TYPE_DESCRIPTIONS[activeType]}</p>
            <ContentForm activeType={activeType} fields={fields} onChange={updateField} />
          </div>
        </section>

        <section className="section section-b">
          <div className="section-inner">
            <div className="section-head">
              <div>
                <h2>Customize</h2>
                <p>Colors, shape, a logo, or a scan-me banner.</p>
              </div>
            </div>

            <CustomizePanel
              opts={opts}
              onOptChange={updateOpt}
              errorLevelLocked={errorLevelLocked}
              logo={logo}
              onLogoFile={handleLogoFile}
              onLogoSizeChange={handleLogoSizeChange}
              onRemoveLogo={removeLogo}
              logoInputRef={logoInputRef}
              presetStripRef={presetStripRef}
            />

            <button type="button" className="btn-primary" onClick={() => generate(false)}>
              Generate QR code
            </button>
          </div>
        </section>

        <section className="section section-c">
          <div className="section-inner">
            <div className="section-head">
              <div>
                <h2>Preview &amp; export</h2>
                <p>Updates automatically as you type.</p>
              </div>
            </div>

            <PreviewPanel
              showPlaceholder={showPlaceholder}
              canvasWrapRef={canvasWrapRef}
              info={info}
              message={message}
              onDownloadPng={downloadPNG}
              onDownloadSvg={downloadSVGFile}
              onCopy={copyToClipboard}
            />

            {history.length > 0 && (
              <div className="history-strip">
                <div className="history-head">
                  <span>Recent</span>
                  <button type="button" className="history-clear" onClick={clearHistory}>Clear</button>
                </div>
                <div className="history-items">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="history-item"
                      title={item.snippet}
                      onClick={() => downloadHref(item.dataURL, `qrcode-${item.id}.png`)}
                    >
                      <img src={item.dataURL} alt={item.snippet} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
          </>
        )}

        {mode === 'scan' && (
          <section className="section section-c">
            <div className="section-inner">
              <div className="section-head">
                <div>
                  <h2>Scan a QR code</h2>
                  <p>Upload an image or use your camera — nothing leaves your browser.</p>
                </div>
              </div>
              <ScannerPanel />
            </div>
          </section>
        )}

        <section className="section section-d">
          <div className="section-inner">
            <div className="section-head">
              <div>
                <h2>How to use it</h2>
                <p>Four steps, no sign-up.</p>
              </div>
            </div>

            <div className="how-grid">
              <div className="how-step">
                <h3>Pick a type</h3>
                <p>Text, a URL, WiFi, a contact card, and more.</p>
              </div>
              <div className="how-step">
                <h3>Customize it</h3>
                <p>Colors, shapes, a logo, or a scan-me banner.</p>
              </div>
              <div className="how-step">
                <h3>Watch it update</h3>
                <p>The preview regenerates live as you type — no button needed.</p>
              </div>
              <div className="how-step">
                <h3>Download &amp; share</h3>
                <p>Save as PNG or SVG, or copy it straight to your clipboard.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section section-a">
          <div className="section-inner">
            <div className="section-head">
              <div>
                <h2>Frequently asked questions</h2>
                <p>The short version: it's free, and there's nothing to sign up for.</p>
              </div>
            </div>

            <div className="faq-list">
              <div className="faq-item">
                <h3>Is QR Art really free?</h3>
                <p>Yes. QR Art is completely free with no hidden fees, subscriptions, or premium tiers.</p>
              </div>
              <div className="faq-item">
                <h3>Do I need to sign up or log in?</h3>
                <p>No. There's no sign-up, no login, and no account of any kind — just open the page and generate your QR code.</p>
              </div>
              <div className="faq-item">
                <h3>Is my data safe? Where is it stored?</h3>
                <p>Everything happens in your browser. Nothing you type or upload is ever sent to a server, so there's nothing to store or leak.</p>
              </div>
              <div className="faq-item">
                <h3>What can I make QR codes for?</h3>
                <p>Plain text, website URLs, multiple URLs combined into one code, email, phone numbers, SMS, WiFi networks, UPI payments, and contact cards (vCard).</p>
              </div>
              <div className="faq-item">
                <h3>What formats can I download?</h3>
                <p>PNG or SVG, or you can copy the image straight to your clipboard.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <span><strong>QR Art</strong> — everything runs in your browser. Nothing you enter is uploaded anywhere.</span>
          <div className="footer-credit">
            <span>Developed by B.Dhruva</span>
            <a
              href="https://www.linkedin.com/in/dhruva-kumar-reddy-bodingaru-17354b384"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-icon-link"
              aria-label="LinkedIn profile"
              title="LinkedIn"
            >
              <LinkedInIcon />
            </a>
            <a
              href="https://github.com/DhruvaKR"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-icon-link"
              aria-label="GitHub profile"
              title="GitHub"
            >
              <GithubIcon />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

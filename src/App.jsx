import { useEffect, useRef, useState } from 'react';
import qrcodegen from 'qrcode-generator';
import brandLogo from './assets/logo.png';
import TypePicker from './components/TypePicker.jsx';
import ContentForm from './components/ContentForm.jsx';
import CustomizePanel from './components/CustomizePanel.jsx';
import PreviewPanel from './components/PreviewPanel.jsx';
import { GithubIcon, LinkedInIcon } from './icons.jsx';
import { DataBuilders, TYPE_DESCRIPTIONS } from './lib/dataBuilders.js';
import { renderCanvas, renderSVG } from './lib/renderer.js';
import { STYLE_PRESETS } from './lib/presets.js';
import { DEFAULT_FIELDS, DEFAULT_OPTS, downloadHref } from './lib/constants.js';

export default function App() {
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

  const canvasWrapRef = useRef(null);
  const presetStripRef = useRef(null);
  const logoInputRef = useRef(null);
  const autoTimerRef = useRef(null);
  const didMountRef = useRef(false);
  const prevErrorLevelRef = useRef('M');

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

  function generateSingle(auto) {
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

    setCurrentQRText(text);
    setCurrentPNGDataURL(canvas.toDataURL('image/png', 1.0));
    setInfo({ type: activeType, width: canvas.width, height: canvas.height, length: text.length, errorLevel: renderOpts.errorLevel });
    setShowPlaceholder(false);
    if (!auto) setMessage({ text: 'QR code generated.', kind: 'success' });
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

  function generate(auto) {
    setMessage(null);
    if (canvasWrapRef.current) canvasWrapRef.current.innerHTML = '';
    setInfo(null);
    setShowPlaceholder(true);

    try {
      generateSingle(auto);
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
      generate(false);
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
              <p>Custom QR codes in seconds</p>
            </div>
          </div>
          <span className="header-badge">Free &amp; private — runs in your browser</span>
        </div>
      </header>

      <main>
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
          </div>
        </section>

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
      </main>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <span><strong>QR Art</strong> — everything runs in your browser. Nothing you enter is uploaded anywhere.</span>
          <div className="footer-credit">
            <span>Developed by Dhruva</span>
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

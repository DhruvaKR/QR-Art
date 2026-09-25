import ColorField from './ColorField.jsx';

export default function CustomizePanel({
  opts,
  onOptChange,
  errorLevelLocked,
  logo,
  onLogoFile,
  onLogoSizeChange,
  onRemoveLogo,
  logoInputRef,
  presetStripRef
}) {
  const set = (key) => (e) => onOptChange(key, e.target.value);
  const setChecked = (key) => (e) => onOptChange(key, e.target.checked);
  const setNumber = (key) => (e) => onOptChange(key, parseInt(e.target.value, 10));

  return (
    <>
      <div className="field">
        <span>Quick styles</span>
        <div className="preset-strip" ref={presetStripRef} />
      </div>

      <div className="field-row">
        <label className="field">
          <span>Size <em>{opts.size}px</em></span>
          <input type="range" min={150} max={500} step={10} value={opts.size} onChange={setNumber('size')} />
        </label>
        <label className="field">
          <span>Error correction</span>
          <select value={opts.errorLevel} onChange={set('errorLevel')} disabled={errorLevelLocked}>
            <option value="L">Low (~7%)</option>
            <option value="M">Medium (~15%)</option>
            <option value="Q">Quartile (~25%)</option>
            <option value="H">High (~30%)</option>
          </select>
        </label>
      </div>

      <div className="field-row">
        <ColorField label="Foreground" value={opts.fgColor} onChange={(v) => onOptChange('fgColor', v)} />
        <ColorField label="Background" value={opts.bgColor} onChange={(v) => onOptChange('bgColor', v)} />
      </div>

      <details className="advanced">
        <summary>Style &amp; gradient</summary>
        <div className="field-row">
          <label className="field">
            <span>Dot style</span>
            <select value={opts.dotStyle} onChange={set('dotStyle')}>
              <option value="square">Square</option>
              <option value="rounded">Rounded</option>
              <option value="dots">Dots</option>
            </select>
          </label>
          <label className="field">
            <span>Corner style</span>
            <select value={opts.cornerStyle} onChange={set('cornerStyle')}>
              <option value="square">Square</option>
              <option value="rounded">Rounded</option>
              <option value="dot">Dot</option>
            </select>
          </label>
        </div>

        <label className="checkbox">
          <input type="checkbox" checked={opts.eyeColorEnabled} onChange={setChecked('eyeColorEnabled')} />
          <span>Custom corner color</span>
        </label>
        {opts.eyeColorEnabled && (
          <div className="field-row">
            <ColorField label="Corner color" value={opts.eyeColor} onChange={(v) => onOptChange('eyeColor', v)} />
          </div>
        )}

        <label className="checkbox">
          <input type="checkbox" checked={opts.gradientEnabled} onChange={setChecked('gradientEnabled')} />
          <span>Use gradient instead of flat color</span>
        </label>
        {opts.gradientEnabled && (
          <div className="field-row">
            <label className="field">
              <span>Gradient type</span>
              <select value={opts.gradientType} onChange={set('gradientType')}>
                <option value="linear">Linear</option>
                <option value="radial">Radial</option>
              </select>
            </label>
            <ColorField label="Second color" value={opts.gradientColor2} onChange={(v) => onOptChange('gradientColor2', v)} />
          </div>
        )}
      </details>

      <details className="advanced">
        <summary>Logo</summary>
        <label className="field">
          <span>Upload image</span>
          <input ref={logoInputRef} type="file" accept="image/*" onChange={onLogoFile} />
        </label>
        {logo.image && (
          <>
            <div className="field-row">
              <label className="field">
                <span>Logo size <em>{logo.sizePercent}%</em></span>
                <input type="range" min={10} max={30} step={1} value={logo.sizePercent} onChange={onLogoSizeChange} />
              </label>
            </div>
            <p className="hint">Error correction switched to High so the code stays scannable.</p>
            <button type="button" className="btn-ghost" onClick={onRemoveLogo}>Remove logo</button>
          </>
        )}
      </details>

      <details className="advanced">
        <summary>Frame &amp; label</summary>
        <label className="checkbox">
          <input type="checkbox" checked={opts.frameEnabled} onChange={setChecked('frameEnabled')} />
          <span>Add a text banner</span>
        </label>
        {opts.frameEnabled && (
          <div>
            <label className="field">
              <span>Banner text</span>
              <input type="text" maxLength={30} value={opts.frameText} onChange={set('frameText')} />
            </label>
            <div className="field-row">
              <label className="field">
                <span>Position</span>
                <select value={opts.framePosition} onChange={set('framePosition')}>
                  <option value="bottom">Bottom</option>
                  <option value="top">Top</option>
                </select>
              </label>
              <ColorField label="Banner color" value={opts.frameColor} onChange={(v) => onOptChange('frameColor', v)} />
              <ColorField label="Text color" value={opts.frameTextColor} onChange={(v) => onOptChange('frameTextColor', v)} />
            </div>
          </div>
        )}
      </details>
    </>
  );
}

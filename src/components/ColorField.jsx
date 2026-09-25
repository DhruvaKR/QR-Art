import { useEffect, useState } from 'react';

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export default function ColorField({ label, value, onChange }) {
  const [hexText, setHexText] = useState(value);

  // Keep the text box in sync when the color changes from elsewhere (swatch, preset, etc.)
  useEffect(() => {
    setHexText(value);
  }, [value]);

  function handleHexChange(e) {
    let v = e.target.value;
    if (v && !v.startsWith('#')) v = `#${v}`;
    setHexText(v);
    if (HEX_RE.test(v)) onChange(v);
  }

  function handleHexBlur() {
    setHexText(value); // discard an incomplete/invalid hex on blur
  }

  return (
    <label className="field field-color">
      <span>{label}</span>
      <div className="color-field-row">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
        <input
          type="text"
          className="hex-input"
          value={hexText}
          onChange={handleHexChange}
          onBlur={handleHexBlur}
          maxLength={7}
          spellCheck={false}
          placeholder="#000000"
          aria-label={`${label} hex code`}
        />
      </div>
    </label>
  );
}

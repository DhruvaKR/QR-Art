import { DATA_TYPE_LABELS } from '../lib/dataBuilders.js';
import { ERROR_LEVEL_NAMES } from '../lib/constants.js';
import { DownloadIcon, FileIcon, CopyIcon } from '../icons.jsx';

export default function PreviewPanel({
  showPlaceholder,
  canvasWrapRef,
  info,
  message,
  onDownloadPng,
  onDownloadSvg,
  onCopy
}) {
  const hasResult = !showPlaceholder;

  return (
    <div className="preview-wrap">
      <div className="preview-box">
        {showPlaceholder && <p className="placeholder">Your QR code will appear here</p>}

        <div className="qr-canvas-wrap" ref={canvasWrapRef} hidden={showPlaceholder} />

        {hasResult && info && (
          <dl className="qr-meta">
            <dt>Type</dt><dd>{DATA_TYPE_LABELS[info.type] || info.type}</dd>
            <dt>Size</dt><dd>{info.width}×{info.height}px</dd>
            <dt>Length</dt><dd>{info.length} chars</dd>
            <dt>Error correction</dt><dd>{ERROR_LEVEL_NAMES[info.errorLevel]}</dd>
          </dl>
        )}

        {hasResult && (
          <div className="actions">
            <button type="button" onClick={onDownloadPng}><DownloadIcon />Download PNG</button>
            <button type="button" onClick={onDownloadSvg}><FileIcon />Download SVG</button>
            <button type="button" onClick={onCopy}><CopyIcon />Copy image</button>
          </div>
        )}
      </div>

      <div id="messages" aria-live="polite">
        {message && <p className={`toast ${message.kind}`}>{message.text}</p>}
      </div>
    </div>
  );
}

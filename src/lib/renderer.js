/* Draws a QR matrix (from the qrcode-generator lib) onto a <canvas> or into an SVG string,
   with pluggable dot/corner shapes, gradients, a center logo, and an optional text banner. */
import { escapeHtml } from './dataBuilders.js';

function isEyeModule(row, col, moduleCount) {
  return (row < 7 && col < 7) ||
         (row < 7 && col >= moduleCount - 7) ||
         (row >= moduleCount - 7 && col < 7);
}

const EYE_POSITIONS_OF = (moduleCount) => [
  [0, 0],
  [0, moduleCount - 7],
  [moduleCount - 7, 0]
];

function frameHeightFor(qrSize) {
  return Math.max(50, Math.round(qrSize * 0.18));
}

/* ---------- Canvas rendering ---------- */

function roundedRectPath(ctx, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawModule(ctx, x, y, cellSize, style) {
  if (style === 'dots') {
    ctx.beginPath();
    ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize * 0.42, 0, Math.PI * 2);
    ctx.fill();
  } else if (style === 'rounded') {
    roundedRectPath(ctx, x, y, cellSize, cellSize, cellSize * 0.3);
    ctx.fill();
  } else {
    ctx.fillRect(x, y, cellSize, cellSize);
  }
}

function drawEye(ctx, x, y, cellSize, style, color, bgColor) {
  const outer = 7 * cellSize;
  const mid = 5 * cellSize;
  const inner = 3 * cellSize;
  const midOff = cellSize;
  const innerOff = 2 * cellSize;

  const radii = style === 'dot'
    ? [outer / 2, mid / 2, inner / 2]
    : style === 'rounded'
      ? [cellSize * 1.4, cellSize * 0.98, cellSize * 0.7]
      : [0, 0, 0];

  ctx.fillStyle = color;
  roundedRectPath(ctx, x, y, outer, outer, radii[0]);
  ctx.fill();
  ctx.fillStyle = bgColor;
  roundedRectPath(ctx, x + midOff, y + midOff, mid, mid, radii[1]);
  ctx.fill();
  ctx.fillStyle = color;
  roundedRectPath(ctx, x + innerOff, y + innerOff, inner, inner, radii[2]);
  ctx.fill();
}

/**
 * Renders the QR matrix to a canvas element.
 * @param {object} qr - a made qrcode-generator instance
 * @param {object} opt - rendering options
 * @returns {HTMLCanvasElement}
 */
export function renderCanvas(qr, opt) {
  const moduleCount = qr.getModuleCount();
  const cellSize = Math.max(2, Math.floor(opt.size / moduleCount));
  const qrSize = cellSize * moduleCount;
  const frameH = opt.frameEnabled ? frameHeightFor(qrSize) : 0;
  const qrOffsetY = opt.frameEnabled && opt.framePosition === 'top' ? frameH : 0;

  const canvas = document.createElement('canvas');
  canvas.width = qrSize;
  canvas.height = qrSize + frameH;
  const ctx = canvas.getContext('2d', { alpha: false });
  ctx.imageSmoothingEnabled = false;

  ctx.fillStyle = opt.bgColor;
  ctx.fillRect(0, qrOffsetY, qrSize, qrSize);

  let fillStyle = opt.fgColor;
  if (opt.gradientEnabled) {
    const grad = opt.gradientType === 'radial'
      ? ctx.createRadialGradient(qrSize / 2, qrOffsetY + qrSize / 2, 0, qrSize / 2, qrOffsetY + qrSize / 2, qrSize / 2)
      : ctx.createLinearGradient(0, qrOffsetY, qrSize, qrOffsetY + qrSize);
    grad.addColorStop(0, opt.fgColor);
    grad.addColorStop(1, opt.gradientColor2);
    fillStyle = grad;
  }

  ctx.fillStyle = fillStyle;
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (isEyeModule(row, col, moduleCount)) continue;
      if (qr.isDark(row, col)) {
        drawModule(ctx, col * cellSize, qrOffsetY + row * cellSize, cellSize, opt.dotStyle);
      }
    }
  }

  const eyeColor = opt.eyeColorEnabled ? opt.eyeColor : fillStyle;
  EYE_POSITIONS_OF(moduleCount).forEach(([row, col]) => {
    drawEye(ctx, col * cellSize, qrOffsetY + row * cellSize, cellSize, opt.cornerStyle, eyeColor, opt.bgColor);
  });

  if (opt.logoImage) {
    const logoPx = Math.round(qrSize * (opt.logoSizePercent / 100));
    const cx = qrSize / 2;
    const cy = qrOffsetY + qrSize / 2;
    const pad = logoPx * 1.15;

    ctx.fillStyle = opt.bgColor;
    roundedRectPath(ctx, cx - pad / 2, cy - pad / 2, pad, pad, pad * 0.15);
    ctx.fill();
    ctx.drawImage(opt.logoImage, cx - logoPx / 2, cy - logoPx / 2, logoPx, logoPx);
  }

  if (opt.frameEnabled) {
    const frameY = opt.framePosition === 'top' ? 0 : qrSize;
    ctx.fillStyle = opt.frameColor;
    ctx.fillRect(0, frameY, qrSize, frameH);

    ctx.fillStyle = opt.frameTextColor;
    ctx.font = `700 ${Math.round(frameH * 0.4)}px -apple-system, "Segoe UI", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(opt.frameText, qrSize / 2, frameY + frameH / 2, qrSize - 20);
  }

  return canvas;
}

/* ---------- SVG rendering ---------- */

function svgModuleShape(x, y, cellSize, style, fill) {
  if (style === 'dots') {
    const r = cellSize * 0.42;
    return `<circle cx="${x + cellSize / 2}" cy="${y + cellSize / 2}" r="${r}" fill="${fill}"/>`;
  }
  if (style === 'rounded') {
    const r = cellSize * 0.3;
    return `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="${r}" ry="${r}" fill="${fill}"/>`;
  }
  return `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${fill}"/>`;
}

function svgEyeShape(x, y, cellSize, style, color, bgColor) {
  const outer = 7 * cellSize;
  const mid = 5 * cellSize;
  const inner = 3 * cellSize;
  const midOff = cellSize;
  const innerOff = 2 * cellSize;

  const radii = style === 'dot'
    ? [outer / 2, mid / 2, inner / 2]
    : style === 'rounded'
      ? [cellSize * 1.4, cellSize * 0.98, cellSize * 0.7]
      : [0, 0, 0];

  return `<rect x="${x}" y="${y}" width="${outer}" height="${outer}" rx="${radii[0]}" ry="${radii[0]}" fill="${color}"/>` +
         `<rect x="${x + midOff}" y="${y + midOff}" width="${mid}" height="${mid}" rx="${radii[1]}" ry="${radii[1]}" fill="${bgColor}"/>` +
         `<rect x="${x + innerOff}" y="${y + innerOff}" width="${inner}" height="${inner}" rx="${radii[2]}" ry="${radii[2]}" fill="${color}"/>`;
}

/**
 * Builds an SVG string that mirrors renderCanvas()'s output.
 * @param {object} qr - a made qrcode-generator instance
 * @param {object} opt - same options as renderCanvas, plus opt.logoDataURL for <image>
 * @returns {string}
 */
export function renderSVG(qr, opt) {
  const moduleCount = qr.getModuleCount();
  const cellSize = 8;
  const qrSize = cellSize * moduleCount;
  const frameH = opt.frameEnabled ? frameHeightFor(qrSize) : 0;
  const qrOffsetY = opt.frameEnabled && opt.framePosition === 'top' ? frameH : 0;
  const totalH = qrSize + frameH;

  let fillRef = opt.fgColor;
  let defs = '';
  if (opt.gradientEnabled) {
    fillRef = 'url(#qrGradient)';
    defs = opt.gradientType === 'radial'
      ? `<defs><radialGradient id="qrGradient" cx="50%" cy="50%" r="50%">` +
        `<stop offset="0%" stop-color="${opt.fgColor}"/><stop offset="100%" stop-color="${opt.gradientColor2}"/></radialGradient></defs>`
      : `<defs><linearGradient id="qrGradient" x1="0%" y1="0%" x2="100%" y2="100%">` +
        `<stop offset="0%" stop-color="${opt.fgColor}"/><stop offset="100%" stop-color="${opt.gradientColor2}"/></linearGradient></defs>`;
  }

  let svg = `<svg width="${qrSize}" height="${totalH}" viewBox="0 0 ${qrSize} ${totalH}" xmlns="http://www.w3.org/2000/svg">`;
  svg += defs;
  svg += `<rect x="0" y="${qrOffsetY}" width="${qrSize}" height="${qrSize}" fill="${opt.bgColor}"/>`;

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (isEyeModule(row, col, moduleCount)) continue;
      if (qr.isDark(row, col)) {
        svg += svgModuleShape(col * cellSize, qrOffsetY + row * cellSize, cellSize, opt.dotStyle, fillRef);
      }
    }
  }

  const eyeColor = opt.eyeColorEnabled ? opt.eyeColor : fillRef;
  EYE_POSITIONS_OF(moduleCount).forEach(([row, col]) => {
    svg += svgEyeShape(col * cellSize, qrOffsetY + row * cellSize, cellSize, opt.cornerStyle, eyeColor, opt.bgColor);
  });

  if (opt.logoDataURL) {
    const logoPx = Math.round(qrSize * (opt.logoSizePercent / 100));
    const cx = qrSize / 2;
    const cy = qrOffsetY + qrSize / 2;
    const pad = logoPx * 1.15;
    svg += `<rect x="${cx - pad / 2}" y="${cy - pad / 2}" width="${pad}" height="${pad}" rx="${pad * 0.15}" fill="${opt.bgColor}"/>`;
    svg += `<image x="${cx - logoPx / 2}" y="${cy - logoPx / 2}" width="${logoPx}" height="${logoPx}" href="${opt.logoDataURL}"/>`;
  }

  if (opt.frameEnabled) {
    const frameY = opt.framePosition === 'top' ? 0 : qrSize;
    svg += `<rect x="0" y="${frameY}" width="${qrSize}" height="${frameH}" fill="${opt.frameColor}"/>`;
    svg += `<text x="${qrSize / 2}" y="${frameY + frameH / 2}" fill="${opt.frameTextColor}" ` +
      `font-family="-apple-system, Segoe UI, sans-serif" font-weight="700" font-size="${Math.round(frameH * 0.4)}" ` +
      `text-anchor="middle" dominant-baseline="middle">${escapeHtml(opt.frameText)}</text>`;
  }

  svg += '</svg>';
  return svg;
}

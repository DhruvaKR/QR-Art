# QR Art

A free, fast QR code generator that runs entirely in the browser — no
sign-up, no server, nothing you enter ever leaves your device. Built with
React + Vite.

## Features

- **Multiple content types**: text, URLs, email, phone, SMS, WiFi, contact card (vCard) — picked from an icon toolbar with a one-line description of what each type does
- **Multi URL**: paste several URLs (one per line) and combine them into a single QR code — scanning it reveals the whole list as text
- **Quick style presets**: a row of live mini-QR thumbnails (Classic, Indigo Rounded, Dots, Indigo Gradient, Sunset) — click one to apply that whole look instantly
- **Custom styling**: flat colors or linear/radial gradients, square/rounded/dot module shapes, independent corner (eye) styling
- **Logo embedding**: upload any image to sit in the center of the code (error correction auto-switches to High for scannability)
- **Frame/banner**: optional "Scan Me" text banner in any color, top or bottom
- **Live preview**: the QR code regenerates automatically as you type or adjust any setting — no button press needed
- **Export**: download as PNG or SVG, or copy the image straight to the clipboard
- **How to use it**: a quick 4-step guide at the bottom of the page
- Full-width, color-coded sections (indigo/violet/pink/teal); responsive from mobile to desktop

## Project structure

```
index.html                 Vite entry HTML
src/main.jsx                React root
src/App.jsx                 top-level state + layout (content, customize, preview sections)
src/index.css               all styling
src/icons.jsx                inline SVG icon set (type tabs, action buttons)
src/components/              TypePicker, ContentForm, CustomizePanel, PreviewPanel
src/lib/dataBuilders.js      builds the raw string encoded per content type (URL, WiFi, vCard, ...)
src/lib/renderer.js          draws the QR matrix to <canvas> and to SVG (shapes, gradients, logo, frame)
src/lib/presets.js           quick style preset definitions
src/lib/constants.js         shared defaults and small helpers
legacy-static/                the previous plain HTML/CSS/JS version, kept for reference
```

QR encoding uses the `qrcode-generator` package (same library the earlier
static version bundled directly).

## Running locally

```
npm install
npm run dev
```

## Building

```
npm run build   # outputs to dist/
npm run preview # serve the production build locally
```

## Deploying on Vercel

This is a standard Vite app — Vercel auto-detects it. Push to a Git repo,
import it in Vercel, and it will run `npm run build` and serve `dist/`
with no extra configuration.

## License

Open-source and free to use.

#!/usr/bin/env node
/**
 * Generates all app icons from the master SVG.
 *
 * Outputs:
 *   public/favicon.ico              (16 × 16, 32 × 32, 48 × 48)
 *   public/apple-touch-icon.png     (180 × 180)
 *   public/icons/icon-192.png       (192 × 192)
 *   public/icons/icon-512.png       (512 × 512)
 *   public/icon.svg                 (master — scalable)
 *
 * Design: minimalist wireframe — open book + ray of light, 2 colors only
 *         (navy #1b2a40 background, gold #d4a84b strokes, no fills/gradients).
 */

const sharp = require('sharp');
const fs    = require('fs');
const path  = require('path');

const PUBLIC = path.resolve(__dirname, '..', 'public');

// ── Master SVG (512 × 512 canvas) ──────────────────────────────────────────
// Strict 2-color wireframe: navy fill + gold strokes, zero gradients/fills.
const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">

  <!-- Background: deep navy, iOS-style rounded square -->
  <rect width="512" height="512" rx="88" fill="#1b2a40"/>

  <!-- Book: left page (trapezoid outline, no fill) -->
  <polygon points="82,277 76,387 256,400 256,272"
           fill="none" stroke="#d4a84b" stroke-width="11" stroke-linejoin="round"/>

  <!-- Book: right page (mirror) -->
  <polygon points="256,272 256,400 436,387 430,277"
           fill="none" stroke="#d4a84b" stroke-width="11" stroke-linejoin="round"/>

  <!-- Spine: vertical line from ray tip through book base -->
  <line x1="256" y1="64" x2="256" y2="402"
        stroke="#d4a84b" stroke-width="13" stroke-linecap="round"/>

  <!-- Ray: left diagonal -->
  <line x1="256" y1="272" x2="112" y2="100"
        stroke="#d4a84b" stroke-width="8" stroke-linecap="round"/>

  <!-- Ray: right diagonal (mirror) -->
  <line x1="256" y1="272" x2="400" y2="100"
        stroke="#d4a84b" stroke-width="8" stroke-linecap="round"/>

</svg>`;

// ── ICO builder (embeds PNG chunks — works in all modern browsers) ──────────
function buildIco(pngBuffers, sizes) {
  const count      = pngBuffers.length;
  const headerSize = 6 + count * 16;
  const total      = headerSize + pngBuffers.reduce((s, b) => s + b.length, 0);
  const buf        = Buffer.alloc(total);

  buf.writeUInt16LE(0, 0);      // Reserved
  buf.writeUInt16LE(1, 2);      // Type: ICO
  buf.writeUInt16LE(count, 4);  // Image count

  let dataOffset = headerSize;
  for (let i = 0; i < count; i++) {
    const png  = pngBuffers[i];
    const sz   = sizes[i];
    const base = 6 + i * 16;

    buf.writeUInt8(sz >= 256 ? 0 : sz, base);      // Width  (0 = 256)
    buf.writeUInt8(sz >= 256 ? 0 : sz, base + 1);  // Height
    buf.writeUInt8(0, base + 2);                    // ColorCount (truecolor)
    buf.writeUInt8(0, base + 3);                    // Reserved
    buf.writeUInt16LE(1, base + 4);                 // Planes
    buf.writeUInt16LE(32, base + 6);                // BitCount
    buf.writeUInt32LE(png.length, base + 8);        // BytesInRes
    buf.writeUInt32LE(dataOffset, base + 12);       // ImageOffset

    png.copy(buf, dataOffset);
    dataOffset += png.length;
  }

  return buf;
}

// ── Main ───────────────────────────────────────────────────────────────────
async function run() {
  const svgBuf = Buffer.from(SVG);
  const resize = (size) =>
    sharp(svgBuf).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

  console.log('Rendering icons…');
  const [s16, s32, s48, s180, s192, s512] = await Promise.all([
    resize(16), resize(32), resize(48), resize(180), resize(192), resize(512),
  ]);

  fs.mkdirSync(path.join(PUBLIC, 'icons'), { recursive: true });

  // PWA icons
  fs.writeFileSync(path.join(PUBLIC, 'icons', 'icon-192.png'), s192);
  fs.writeFileSync(path.join(PUBLIC, 'icons', 'icon-512.png'), s512);

  // Apple touch icon
  fs.writeFileSync(path.join(PUBLIC, 'apple-touch-icon.png'), s180);

  // Multi-size favicon
  const ico = buildIco([s16, s32, s48], [16, 32, 48]);
  fs.writeFileSync(path.join(PUBLIC, 'favicon.ico'), ico);

  // Master SVG (scalable, referenced by <link rel="icon" type="image/svg+xml">)
  fs.writeFileSync(path.join(PUBLIC, 'icon.svg'), SVG);

  console.log('✓ public/favicon.ico            (16 × 16, 32 × 32, 48 × 48)');
  console.log('✓ public/apple-touch-icon.png   (180 × 180)');
  console.log('✓ public/icons/icon-192.png     (192 × 192)');
  console.log('✓ public/icons/icon-512.png     (512 × 512)');
  console.log('✓ public/icon.svg               (master SVG)');
}

run().catch((e) => { console.error(e); process.exit(1); });

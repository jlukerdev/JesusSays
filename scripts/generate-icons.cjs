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
 * Design: open book with upward ray of light, navy bg + gold palette.
 */

const sharp = require('sharp');
const fs    = require('fs');
const path  = require('path');

const PUBLIC = path.resolve(__dirname, '..', 'public');

// ── Master SVG (512 × 512 canvas) ──────────────────────────────────────────
const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <!-- Ray: bright gold at origin, fades to transparent at tip -->
    <linearGradient id="rayGrad" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%"   stop-color="#f5c842" stop-opacity="1"/>
      <stop offset="65%"  stop-color="#d4a84b" stop-opacity="0.65"/>
      <stop offset="100%" stop-color="#d4a84b" stop-opacity="0"/>
    </linearGradient>

    <!-- Soft glow halo at the ray/spine origin -->
    <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="#d4a84b" stop-opacity="0.42"/>
      <stop offset="100%" stop-color="#d4a84b" stop-opacity="0"/>
    </radialGradient>

    <!-- Left page: darker at outer edge, parchment near spine -->
    <linearGradient id="leftPage" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="#c4bfb0"/>
      <stop offset="45%"  stop-color="#eeebe3"/>
      <stop offset="100%" stop-color="#faf9f6"/>
    </linearGradient>

    <!-- Right page: parchment near spine, darker at outer edge -->
    <linearGradient id="rightPage" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="#faf9f6"/>
      <stop offset="55%"  stop-color="#eeebe3"/>
      <stop offset="100%" stop-color="#c4bfb0"/>
    </linearGradient>
  </defs>

  <!-- ── Background: deep navy, iOS-style rounded square ── -->
  <rect width="512" height="512" rx="88" fill="#1b2a40"/>

  <!-- ── Glow halo at spine / ray origin ── -->
  <ellipse cx="256" cy="270" rx="88" ry="52" fill="url(#glowGrad)"/>

  <!-- ── Side rays: faint diagonal lines from spine origin ── -->
  <line x1="256" y1="270" x2="120" y2="112" stroke="#d4a84b" stroke-width="2.5" opacity="0.28"/>
  <line x1="256" y1="270" x2="392" y2="112" stroke="#d4a84b" stroke-width="2.5" opacity="0.28"/>
  <line x1="256" y1="270" x2="168" y2="74"  stroke="#d4a84b" stroke-width="1.5" opacity="0.18"/>
  <line x1="256" y1="270" x2="344" y2="74"  stroke="#d4a84b" stroke-width="1.5" opacity="0.18"/>

  <!-- ── Main ray: tapered triangle pointing up ── -->
  <polygon points="243,275 269,275 256,60" fill="url(#rayGrad)"/>

  <!-- ── Book pages ── -->
  <!-- Left page  (trapezoid, fanning to the left) -->
  <polygon points="256,268 256,398 72,385 80,273" fill="url(#leftPage)"/>
  <!-- Right page (mirror) -->
  <polygon points="256,268 256,398 440,385 432,273" fill="url(#rightPage)"/>

  <!-- ── Text lines — left page ── -->
  <line x1="100" y1="305" x2="247" y2="298" stroke="#8a7d60" stroke-width="2.2" opacity="0.52"/>
  <line x1="100" y1="324" x2="247" y2="317" stroke="#8a7d60" stroke-width="2.2" opacity="0.52"/>
  <line x1="100" y1="343" x2="247" y2="337" stroke="#8a7d60" stroke-width="2.2" opacity="0.47"/>
  <line x1="100" y1="362" x2="247" y2="357" stroke="#8a7d60" stroke-width="2.2" opacity="0.42"/>
  <line x1="100" y1="378" x2="247" y2="374" stroke="#8a7d60" stroke-width="2.2" opacity="0.36"/>

  <!-- ── Text lines — right page ── -->
  <line x1="265" y1="298" x2="412" y2="305" stroke="#8a7d60" stroke-width="2.2" opacity="0.52"/>
  <line x1="265" y1="317" x2="412" y2="324" stroke="#8a7d60" stroke-width="2.2" opacity="0.52"/>
  <line x1="265" y1="337" x2="412" y2="343" stroke="#8a7d60" stroke-width="2.2" opacity="0.47"/>
  <line x1="265" y1="357" x2="412" y2="362" stroke="#8a7d60" stroke-width="2.2" opacity="0.42"/>
  <line x1="265" y1="374" x2="412" y2="378" stroke="#8a7d60" stroke-width="2.2" opacity="0.36"/>

  <!-- ── Book outlines in gold ── -->
  <polygon points="256,268 256,398 72,385 80,273"
           fill="none" stroke="#d4a84b" stroke-width="3" stroke-linejoin="round"/>
  <polygon points="256,268 256,398 440,385 432,273"
           fill="none" stroke="#d4a84b" stroke-width="3" stroke-linejoin="round"/>

  <!-- ── Spine: solid gold bar ── -->
  <rect x="249" y="264" width="14" height="136" rx="5" fill="#d4a84b"/>
  <!-- Spine highlight (inner shine) -->
  <rect x="251" y="267" width="5"  height="130" rx="3" fill="#f5c842" opacity="0.42"/>
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

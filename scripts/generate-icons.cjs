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
// 2-color wireframe: navy bg + gold strokes only (no fills / gradients).
// Closely matches the reference: open book with curved pages, page-thickness
// strips, rounded cover arc, 4 text lines per page, 7 radiating rays.
const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">

  <!-- Background: app navy -->
  <rect width="512" height="512" rx="88" fill="#1b2a40"/>

  <!-- ══ RAYS ══
       7 lines fanning from spine top at (256, 286):
       center vertical + 3 pairs at ±15°, ±30°, ±45°               -->
  <g stroke="#d4a84b" stroke-linecap="round" stroke-width="9">
    <line x1="256" y1="286" x2="256" y2="108"/>
    <line x1="256" y1="286" x2="212" y2="124"/>
    <line x1="256" y1="286" x2="300" y2="124"/>
    <line x1="256" y1="286" x2="178" y2="154"/>
    <line x1="256" y1="286" x2="334" y2="154"/>
    <line x1="256" y1="286" x2="160" y2="196"/>
    <line x1="256" y1="286" x2="352" y2="196"/>
  </g>

  <!-- ══ BOOK ══ -->
  <g fill="none" stroke="#d4a84b" stroke-linejoin="round" stroke-linecap="round">

    <!-- Page-thickness strips: thin parallelograms on outer edges -->
    <path d="M 82,274 L 68,280 L 52,420 L 66,417 Z" stroke-width="9"/>
    <path d="M 430,274 L 444,280 L 460,420 L 446,417 Z" stroke-width="9"/>

    <!-- Left page outline
         Top edge:    quadratic arc from spine (256,286) → outer corner (82,274)
         Outer edge:  straight line down to outer bottom (66,417)
         Bottom edge: quadratic arc → spine fold (256,450)
         Spine edge:  implicit straight line via Z back to (256,286)         -->
    <path d="M 256,286 Q 169,271 82,274 L 66,417 Q 161,447 256,450 Z"
          stroke-width="10"/>

    <!-- Right page outline (mirror) -->
    <path d="M 256,286 Q 343,271 430,274 L 446,417 Q 351,447 256,450 Z"
          stroke-width="10"/>

    <!-- Book cover: smooth cubic arc below the pages showing physical depth -->
    <path d="M 66,417 C 80,472 432,472 446,417" stroke-width="10"/>

    <!-- Text lines — left page (4 lines, angled with page perspective) -->
    <line x1="102" y1="316" x2="234" y2="308" stroke-width="8"/>
    <line x1="102" y1="346" x2="234" y2="339" stroke-width="8"/>
    <line x1="102" y1="376" x2="234" y2="370" stroke-width="8"/>
    <line x1="102" y1="406" x2="234" y2="401" stroke-width="8"/>

    <!-- Text lines — right page (mirror) -->
    <line x1="278" y1="308" x2="410" y2="316" stroke-width="8"/>
    <line x1="278" y1="339" x2="410" y2="346" stroke-width="8"/>
    <line x1="278" y1="370" x2="410" y2="376" stroke-width="8"/>
    <line x1="278" y1="401" x2="410" y2="406" stroke-width="8"/>

  </g>

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

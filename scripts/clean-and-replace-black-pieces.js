const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

// Where to find your uploaded PNGs (drop your six PNGs here)
// Expected filenames: bishop.png, king.png, knight.png, pawn.png, queen.png, rook.png
const SRC_DIR = path.join(__dirname, '..', 'assets', 'black-pngs');
// Destination is the public pieces folder used by the app
const OUT_DIR = path.join(__dirname, '..', 'public', 'pieces');

// Map source file -> output filename used by the app
const MAPPING = {
  pawn: 'b-p.png',
  queen: 'b-q.png',
  king: 'b-k.png',
  bishop: 'b-b.png',
  rook: 'b-r.png',
  knight: 'b-n.png',
};

// Utility: ensure directory exists
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// Utility: Euclidean color distance
function colorDist(a, b) {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

// Sample an average background color from the 4 corners (each a small square)
function sampleBackgroundColor(ctx, w, h) {
  const sampleSize = Math.max(4, Math.floor(Math.min(w, h) * 0.05));
  const regions = [
    { x: 0, y: 0 }, // TL
    { x: w - sampleSize, y: 0 }, // TR
    { x: 0, y: h - sampleSize }, // BL
    { x: w - sampleSize, y: h - sampleSize }, // BR
  ];
  let r = 0, g = 0, b = 0, n = 0;
  for (const { x, y } of regions) {
    const data = ctx.getImageData(x, y, sampleSize, sampleSize).data;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i + 0];
      g += data[i + 1];
      b += data[i + 2];
      n += 1;
    }
  }
  return { r: Math.round(r / n), g: Math.round(g / n), b: Math.round(b / n) };
}

// Remove near-uniform background by chroma key against sampled bg color
function removeBackgroundToAlpha(srcCanvas, opts = {}) {
  const { threshold = 35, soften = 10 } = opts; // tweak if edges look harsh
  const w = srcCanvas.width;
  const h = srcCanvas.height;
  const ctx = srcCanvas.getContext('2d');

  const bg = sampleBackgroundColor(ctx, w, h);
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;

  // Two-zone key: fully transparent below threshold, feather near the edge up to threshold+soften
  for (let i = 0; i < d.length; i += 4) {
    const px = { r: d[i], g: d[i + 1], b: d[i + 2] };
    const dist = colorDist(px, bg);
    if (dist <= threshold) {
      d[i + 3] = 0; // fully transparent
    } else if (dist <= threshold + soften) {
      const t = (dist - threshold) / soften; // 0..1
      d[i + 3] = Math.max(0, Math.min(255, d[i + 3] * t)); // feather alpha
    }
  }

  ctx.putImageData(img, 0, 0);
  return srcCanvas;
}

// Trim transparent borders and return a new tightly-cropped canvas
function trimTransparent(canvas, alphaCutoff = 10) {
  const w = canvas.width;
  const h = canvas.height;
  const ctx = canvas.getContext('2d');
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;

  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const a = d[i + 3];
      if (a > alphaCutoff) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    // Image is fully transparent; return as-is
    return canvas;
  }

  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;
  const out = createCanvas(cw, ch);
  const octx = out.getContext('2d');
  octx.drawImage(canvas, minX, minY, cw, ch, 0, 0, cw, ch);
  return out;
}

// Fit the trimmed image into a square canvas (default 256x256) preserving aspect ratio
function fitIntoSquare(canvas, size = 256, padding = 18) {
  const out = createCanvas(size, size);
  const ctx = out.getContext('2d');
  ctx.clearRect(0, 0, size, size);

  const w = canvas.width;
  const h = canvas.height;
  const maxW = size - padding * 2;
  const maxH = size - padding * 2;
  const scale = Math.min(maxW / w, maxH / h);
  const dstW = Math.round(w * scale);
  const dstH = Math.round(h * scale);
  const dx = Math.round((size - dstW) / 2);
  const dy = Math.round((size - dstH) / 2);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(canvas, 0, 0, w, h, dx, dy, dstW, dstH);
  return out;
}

async function processOne(baseName, outName) {
  const candidates = [
    `${baseName}.png`,
    `${baseName}.PNG`,
    `${baseName}.png.png`, // handle accidental double extension
    `${baseName}@2x.png`,
    `${baseName}@3x.png`,
  ];
  let srcPath = null;
  for (const c of candidates) {
    const p = path.join(SRC_DIR, c);
    if (fs.existsSync(p)) { srcPath = p; break; }
  }
  if (!srcPath) {
    console.warn(`⚠️  Missing source for ${baseName} in ${SRC_DIR}`);
    return false;
  }

  const img = await loadImage(srcPath);
  const src = createCanvas(img.width, img.height);
  const sctx = src.getContext('2d');
  sctx.drawImage(img, 0, 0);

  // If the source already has transparency, skip background removal.
  const preHasAlpha = (() => {
    const t = sctx.getImageData(0, 0, img.width, img.height).data;
    for (let i = 3; i < t.length; i += 4) { if (t[i] < 250) return true; }
    return false;
  })();

  if (!preHasAlpha) {
    removeBackgroundToAlpha(src, { threshold: 38, soften: 16 });
  }
  const trimmed = trimTransparent(src);
  // Per-piece padding: pawn slightly smaller
  const pad = baseName === 'pawn' ? 26 : 22;
  const squared = fitIntoSquare(trimmed, 256, pad);

  ensureDir(OUT_DIR);
  const outPath = path.join(OUT_DIR, outName);
  const buf = squared.toBuffer('image/png');
  fs.writeFileSync(outPath, buf);
  console.log(`✅ Wrote ${path.relative(process.cwd(), outPath)} (from ${path.basename(srcPath)})`);
  return true;
}

(async () => {
  ensureDir(SRC_DIR);
  ensureDir(OUT_DIR);

  const tasks = Object.entries(MAPPING).map(([base, out]) => processOne(base, out));
  const results = await Promise.all(tasks);

  const ok = results.every(Boolean);
  if (!ok) {
    console.log('\nSome pieces were missing. Expected the following files in:', SRC_DIR);
    console.log(' - bishop.png, king.png, knight.png, pawn.png, queen.png, rook.png');
    process.exitCode = 1;
  } else {
    console.log('\nAll black pieces processed and replaced.');
  }
})();


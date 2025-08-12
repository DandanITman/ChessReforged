const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '..', 'public', 'pieces'); // assumes white PNGs already exist here
const OUT_DIR = SRC_DIR; // overwrite in place

const WHITE = ['w-p','w-q','w-k','w-b','w-r','w-n'];

function ensureDir(dir) { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); }

function trimTransparent(canvas, alphaCutoff = 10) {
  const w = canvas.width, h = canvas.height;
  const ctx = canvas.getContext('2d');
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (d[i+3] > alphaCutoff) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < minX || maxY < minY) return canvas;
  const cw = maxX - minX + 1, ch = maxY - minY + 1;
  const out = createCanvas(cw, ch);
  out.getContext('2d').drawImage(canvas, minX, minY, cw, ch, 0, 0, cw, ch);
  return out;
}

function fitIntoSquare(canvas, size = 256, padding = 18) {
  const out = createCanvas(size, size);
  const ctx = out.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const maxW = size - padding * 2, maxH = size - padding * 2;
  const scale = Math.min(maxW / w, maxH / h);
  const dstW = Math.round(w * scale), dstH = Math.round(h * scale);
  const dx = Math.round((size - dstW) / 2), dy = Math.round((size - dstH) / 2);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.clearRect(0, 0, size, size);
  ctx.drawImage(canvas, 0, 0, w, h, dx, dy, dstW, dstH);
  return out;
}

async function processPiece(name) {
  const inPath = path.join(SRC_DIR, `${name}.png`);
  if (!fs.existsSync(inPath)) { console.warn(`Missing ${inPath}`); return false; }
  const img = await loadImage(inPath);
  const src = createCanvas(img.width, img.height);
  src.getContext('2d').drawImage(img, 0, 0);
  const trimmed = trimTransparent(src);
  // Slight enlargement: reduce padding by 2px
  const pad = 20; // was ~22 for black; making white a touch bigger
  const squared = fitIntoSquare(trimmed, 256, pad);
  const outPath = path.join(OUT_DIR, `${name}.png`);
  fs.writeFileSync(outPath, squared.toBuffer('image/png'));
  console.log(`Resized ${name}.png -> ${path.relative(process.cwd(), outPath)}`);
  return true;
}

(async () => {
  ensureDir(OUT_DIR);
  const results = await Promise.all(WHITE.map(processPiece));
  if (results.every(Boolean)) console.log('White pieces resized.');
  else process.exitCode = 1;
})();


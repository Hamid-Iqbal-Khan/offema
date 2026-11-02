import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Standard CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  const full = Buffer.concat([typeBuf, data]);
  crc.writeUInt32BE(crc32(full), 0);
  return Buffer.concat([len, full, crc]);
}

function createPng(width, height, getPixel) {
  const rowBytes = width * 4;
  const rawBuffer = Buffer.alloc((1 + rowBytes) * height);

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawBuffer[offset++] = 0; // filter type 0
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      rawBuffer[offset++] = r;
      rawBuffer[offset++] = g;
      rawBuffer[offset++] = b;
      rawBuffer[offset++] = a;
    }
  }

  const compressed = zlib.deflateSync(rawBuffer);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8-bit depth
  ihdr[9] = 6; // RGBA color type
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Brand color: Indigo gradient (#4f46e5 to #7c3aed) with offer beacon
function getBrandPixel(x, y, w, h, isMaskable = false) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Gradient factor from top-left to bottom-right
  const grad = (x + y) / (w + h);
  const baseR = Math.round(79 + grad * (124 - 79));
  const baseG = Math.round(70 + grad * (58 - 70));
  const baseB = Math.round(229 + grad * (237 - 229));

  if (isMaskable) {
    // Solid gradient background for maskable icons
    // Central tag/beacon shape
    const innerRadius = w * 0.28;
    if (dist < innerRadius) {
      // White badge center
      return [255, 255, 255, 255];
    }
    if (dist < innerRadius + 6) {
      // Subtle gold accent ring
      return [250, 204, 21, 255];
    }
    return [baseR, baseG, baseB, 255];
  }

  // Rounded rectangle for standard icons
  const radius = w * 0.22;
  const inRoundedBox = (
    (Math.abs(dx) <= cx - radius || Math.abs(dy) <= cy - radius) ||
    Math.hypot(Math.abs(dx) - (cx - radius), Math.abs(dy) - (cy - radius)) <= radius
  );

  if (!inRoundedBox) {
    return [0, 0, 0, 0]; // Transparent outer
  }

  // Central offer icon beacon (white badge)
  const innerRadius = w * 0.26;
  if (dist < innerRadius) {
    // White inner emblem
    return [255, 255, 255, 255];
  }

  // Tag outline / accent
  if (dist < innerRadius + Math.max(3, w * 0.025)) {
    return [250, 204, 21, 255]; // Gold ring
  }

  return [baseR, baseG, baseB, 255];
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('Generating PWA icons...');

// 1. 192x192 PNG
fs.writeFileSync(
  path.join(publicDir, 'pwa-192x192.png'),
  createPng(192, 192, (x, y, w, h) => getBrandPixel(x, y, w, h, false))
);

// 2. 512x512 PNG
fs.writeFileSync(
  path.join(publicDir, 'pwa-512x512.png'),
  createPng(512, 512, (x, y, w, h) => getBrandPixel(x, y, w, h, false))
);

// 3. 512x512 Maskable PNG
fs.writeFileSync(
  path.join(publicDir, 'pwa-maskable-512x512.png'),
  createPng(512, 512, (x, y, w, h) => getBrandPixel(x, y, w, h, true))
);

// 4. Apple Touch Icon 180x180 PNG
fs.writeFileSync(
  path.join(publicDir, 'apple-touch-icon.png'),
  createPng(180, 180, (x, y, w, h) => getBrandPixel(x, y, w, h, true))
);

// 5. Favicon PNG 32x32
fs.writeFileSync(
  path.join(publicDir, 'favicon.png'),
  createPng(32, 32, (x, y, w, h) => getBrandPixel(x, y, w, h, false))
);

console.log('PWA icons successfully created in /public!');

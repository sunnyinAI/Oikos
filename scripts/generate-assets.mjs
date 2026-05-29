#!/usr/bin/env node
// Generate every icon + splash size Oikos needs from a single source PNG.
//
// Usage:
//   node scripts/generate-assets.mjs                 // uses brand/icon-source.png
//   node scripts/generate-assets.mjs path/to.png     // custom source
//
// Output:
//   - Android mipmap densities  (legacy + round + adaptive foreground)
//   - Adaptive icon XML + brand background color
//   - Android splash PNGs       (drawable-port + drawable-land, 5 dpis)
//   - PWA icons                 (client/public/oikos-icon-{192,512,180,1024}.png)
//
// Requires `sharp` (auto-installs on first run if missing).

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');

// Ensure sharp is available
let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.log('Installing sharp (one-time)…');
  const r = spawnSync('npm', ['install', '--no-save', 'sharp'], { stdio: 'inherit', cwd: repoRoot });
  if (r.status !== 0) {
    console.error('Failed to install sharp. Run: npm install sharp --no-save');
    process.exit(1);
  }
  sharp = (await import('sharp')).default;
}

const sourceArg = process.argv[2];
const SOURCE = sourceArg
  ? resolve(process.cwd(), sourceArg)
  : resolve(repoRoot, 'brand', 'icon-source.png');

if (!existsSync(SOURCE)) {
  console.error(`Source icon not found: ${SOURCE}`);
  console.error('');
  console.error('Drop a 1024x1024 PNG (transparent or solid bg both fine) at:');
  console.error(`  ${join(repoRoot, 'brand/icon-source.png')}`);
  console.error('or pass a path:  node scripts/generate-assets.mjs path/to/icon.png');
  process.exit(1);
}

const BRAND_BG = '#FAF7F2';

const ANDROID_RES = join(repoRoot, 'android', 'app', 'src', 'main', 'res');

const MIPMAPS = [
  { dir: 'mipmap-mdpi', size: 48 },
  { dir: 'mipmap-hdpi', size: 72 },
  { dir: 'mipmap-xhdpi', size: 96 },
  { dir: 'mipmap-xxhdpi', size: 144 },
  { dir: 'mipmap-xxxhdpi', size: 192 },
];

const SPLASH_LAND = [
  { dir: 'drawable-land-mdpi', w: 480, h: 320 },
  { dir: 'drawable-land-hdpi', w: 800, h: 480 },
  { dir: 'drawable-land-xhdpi', w: 1280, h: 720 },
  { dir: 'drawable-land-xxhdpi', w: 1600, h: 960 },
  { dir: 'drawable-land-xxxhdpi', w: 1920, h: 1280 },
];
const SPLASH_PORT = [
  { dir: 'drawable-port-mdpi', w: 320, h: 480 },
  { dir: 'drawable-port-hdpi', w: 480, h: 800 },
  { dir: 'drawable-port-xhdpi', w: 720, h: 1280 },
  { dir: 'drawable-port-xxhdpi', w: 960, h: 1600 },
  { dir: 'drawable-port-xxxhdpi', w: 1280, h: 1920 },
];

const ensureDir = (p) => {
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
};

const writeIcon = async (size, outPath) => {
  ensureDir(dirname(outPath));
  await sharp(SOURCE).resize(size, size, { fit: 'cover' }).png().toFile(outPath);
};

const writeAdaptiveForeground = async (size, outPath) => {
  ensureDir(dirname(outPath));
  // Adaptive icon foreground: keep the source padded so it sits well inside the
  // 66% safe zone Android applies.
  const inner = Math.round(size * 0.66);
  const buf = await sharp(SOURCE).resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  await sharp({
    create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: buf, gravity: 'center' }])
    .png()
    .toFile(outPath);
};

const writeSplash = async (w, h, outPath) => {
  ensureDir(dirname(outPath));
  const logoSize = Math.round(Math.min(w, h) * 0.35);
  const logoBuf = await sharp(SOURCE)
    .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  await sharp({
    create: {
      width: w,
      height: h,
      channels: 4,
      background: BRAND_BG,
    },
  })
    .composite([{ input: logoBuf, gravity: 'center' }])
    .png()
    .toFile(outPath);
};

const writeAdaptiveBackgroundXml = () => {
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
`;
  const dir = join(ANDROID_RES, 'mipmap-anydpi-v26');
  ensureDir(dir);
  writeFileSync(join(dir, 'ic_launcher.xml'), xml);
  writeFileSync(join(dir, 'ic_launcher_round.xml'), xml);
};

const writeColorsXml = () => {
  const colorsPath = join(ANDROID_RES, 'values', 'colors.xml');
  ensureDir(dirname(colorsPath));
  let xml = '';
  if (existsSync(colorsPath)) {
    xml = readFileSync(colorsPath, 'utf8');
  }
  if (!xml.includes('ic_launcher_background')) {
    if (xml.includes('</resources>')) {
      xml = xml.replace('</resources>', `    <color name="ic_launcher_background">${BRAND_BG}</color>\n</resources>`);
    } else {
      xml = `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">${BRAND_BG}</color>\n</resources>\n`;
    }
    writeFileSync(colorsPath, xml);
  }
};

(async () => {
  console.log(`Source: ${SOURCE}`);

  // 1) Legacy + round launcher icons across mipmap densities
  for (const { dir, size } of MIPMAPS) {
    await writeIcon(size, join(ANDROID_RES, dir, 'ic_launcher.png'));
    await writeIcon(size, join(ANDROID_RES, dir, 'ic_launcher_round.png'));
    await writeAdaptiveForeground(Math.round(size * 1.5), join(ANDROID_RES, dir, 'ic_launcher_foreground.png'));
    console.log(`  ✓ ${dir} (${size}px)`);
  }

  // 2) Adaptive icon XML + bg color
  writeAdaptiveBackgroundXml();
  writeColorsXml();
  console.log('  ✓ adaptive icon xml + bg color');

  // 3) Splash for all device classes
  for (const s of [...SPLASH_PORT, ...SPLASH_LAND]) {
    await writeSplash(s.w, s.h, join(ANDROID_RES, s.dir, 'splash.png'));
  }
  console.log('  ✓ splash assets');

  // 4) PWA + Apple icons
  const pwaOut = join(repoRoot, 'client', 'public');
  ensureDir(pwaOut);
  await writeIcon(192, join(pwaOut, 'oikos-icon-192.png'));
  await writeIcon(512, join(pwaOut, 'oikos-icon-512.png'));
  await writeIcon(180, join(pwaOut, 'oikos-icon-180.png')); // apple-touch
  await writeIcon(1024, join(pwaOut, 'oikos-icon-1024.png')); // Play Store
  console.log('  ✓ PWA + Apple + 1024 Play-Store icons');

  console.log('\nAll assets generated. Next:');
  console.log('  npm run android:sync && npm run android:open');
})();

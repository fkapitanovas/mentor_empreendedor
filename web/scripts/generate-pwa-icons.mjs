#!/usr/bin/env node
// Generates PWA icons referenced by public/manifest.webmanifest.
//
// Run with:
//   cd web && node scripts/generate-pwa-icons.mjs
//
// Outputs:
//   public/icon-192.png          (192x192, purpose: any)
//   public/icon-512.png          (512x512, purpose: any)
//   public/icon-maskable-512.png (512x512, purpose: maskable — safe area 80%)

import sharp from 'sharp'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PUBLIC_DIR = join(__dirname, '..', 'public')

// Brand tokens mirror --gradient-brand in globals.css
const GRADIENT_FROM = '#10B981'
const GRADIENT_TO = '#047857'

function buildSvg({ size, radius, textSize }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="brand" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${GRADIENT_FROM}"/>
      <stop offset="100%" stop-color="${GRADIENT_TO}"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="url(#brand)"/>
  <text x="50%" y="50%" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="${textSize}" font-weight="800" fill="#FFFFFF" text-anchor="middle" dominant-baseline="central">M</text>
</svg>`
}

async function writePng({ svg, size, outPath }) {
  const buf = await sharp(Buffer.from(svg))
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toBuffer()
  await writeFile(outPath, buf)
  console.log(`wrote ${outPath} (${buf.length} bytes)`)
}

async function main() {
  await mkdir(PUBLIC_DIR, { recursive: true })

  // 192 — standard rounded square (any)
  const svg192 = buildSvg({ size: 192, radius: 32, textSize: 120 })
  await writePng({ svg: svg192, size: 192, outPath: join(PUBLIC_DIR, 'icon-192.png') })

  // 512 — scaled up proportionally (any)
  const svg512 = buildSvg({ size: 512, radius: 96, textSize: 320 })
  await writePng({ svg: svg512, size: 512, outPath: join(PUBLIC_DIR, 'icon-512.png') })

  // 512 maskable — full bleed background, glyph inside 80% safe area
  // Text size ~256 (~50% of size) keeps glyph well inside the safe zone.
  const svgMaskable = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="brand" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${GRADIENT_FROM}"/>
      <stop offset="100%" stop-color="${GRADIENT_TO}"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#brand)"/>
  <text x="50%" y="50%" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="256" font-weight="800" fill="#FFFFFF" text-anchor="middle" dominant-baseline="central">M</text>
</svg>`
  await writePng({ svg: svgMaskable, size: 512, outPath: join(PUBLIC_DIR, 'icon-maskable-512.png') })

  console.log('PWA icons generated.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

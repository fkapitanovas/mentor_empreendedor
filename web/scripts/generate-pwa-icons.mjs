#!/usr/bin/env node
// Generates PWA icons referenced by public/manifest.webmanifest.
//
// Source: public/brand/max-impulso-icon-color.svg (color rocket on transparent)
//
// Run with:
//   cd web && node scripts/generate-pwa-icons.mjs
//
// Outputs:
//   public/icon-192.png          (192x192, purpose: any)          — rocket on cream
//   public/icon-512.png          (512x512, purpose: any)          — rocket on cream
//   public/icon-maskable-512.png (512x512, purpose: maskable)     — rocket on orange, 80% safe area

import sharp from 'sharp'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PUBLIC_DIR = join(__dirname, '..', 'public')
const APP_DIR = join(__dirname, '..', 'src', 'app')
const BRAND_SVG = join(PUBLIC_DIR, 'brand', 'max-impulso-icon-color.svg')

// Max Impulso brand tokens
const CREAM = '#FAFAF9'   // light neutral background
const IMPULSO = '#FF6B35' // brand accent for maskable

// Standard "any" purpose: rocket centered on rounded cream tile.
// Text reads well at small sizes; border-radius matches iOS/Android tile style.
function buildAnySvg({ size, radius, rocketScale }) {
  const rocketSize = Math.round(size * rocketScale)
  const offset = Math.round((size - rocketSize) / 2)
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="${CREAM}"/>
  <g transform="translate(${offset} ${offset}) scale(${rocketSize / 100})">
    <g transform="translate(50 52) rotate(-30)">
      <path d="M -6 22 Q -3 34 0 40 Q 3 34 6 22 Z" fill="#FFA500"/>
      <path d="M -3 22 Q -1 32 0 36 Q 1 32 3 22 Z" fill="#FFE066"/>
      <path d="M -9 -14 L -9 20 L 9 20 L 9 -14 Q 9 -30 0 -40 Q -9 -30 -9 -14 Z" fill="#1F2937"/>
      <circle cx="0" cy="-6" r="4.5" fill="#4FD1C5"/>
      <circle cx="0" cy="-6" r="4.5" fill="none" stroke="#0F172A" stroke-width="1.2"/>
      <path d="M -9 10 L -19 22 L -9 20 Z" fill="#FF6B35"/>
      <path d="M 9 10 L 19 22 L 9 20 Z" fill="#FF6B35"/>
    </g>
  </g>
</svg>`
}

// Maskable: full-bleed brand orange; rocket fits inside 80% safe area.
// Android can crop up to ~20% on each edge, so the glyph must stay centered and smaller.
function buildMaskableSvg({ size }) {
  const rocketSize = Math.round(size * 0.6) // 60% keeps glyph well inside safe area
  const offset = Math.round((size - rocketSize) / 2)
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${IMPULSO}"/>
  <g transform="translate(${offset} ${offset}) scale(${rocketSize / 100})">
    <g transform="translate(50 52) rotate(-30)" fill="#FFFFFF">
      <path d="M -6 22 Q -3 34 0 40 Q 3 34 6 22 Z"/>
      <path d="M -9 -14 L -9 20 L 9 20 L 9 -14 Q 9 -30 0 -40 Q -9 -30 -9 -14 Z"/>
      <path d="M -9 10 L -19 22 L -9 20 Z"/>
      <path d="M 9 10 L 19 22 L 9 20 Z"/>
      <circle cx="0" cy="-6" r="4.5" fill="${IMPULSO}"/>
    </g>
  </g>
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

// Multi-size ICO (16/32/48) with PNG payloads — supported by all modern browsers
async function writeFavicon({ svg, outPath }) {
  const sizes = [16, 32, 48]
  const pngs = await Promise.all(
    sizes.map((s) =>
      sharp(Buffer.from(svg))
        .resize(s, s)
        .png({ compressionLevel: 9 })
        .toBuffer()
    )
  )

  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)          // Reserved
  header.writeUInt16LE(1, 2)          // Type: 1 = ICO
  header.writeUInt16LE(sizes.length, 4)

  const dirEntries = Buffer.alloc(16 * sizes.length)
  let offset = 6 + 16 * sizes.length
  sizes.forEach((s, i) => {
    const base = i * 16
    dirEntries.writeUInt8(s === 256 ? 0 : s, base + 0)   // Width
    dirEntries.writeUInt8(s === 256 ? 0 : s, base + 1)   // Height
    dirEntries.writeUInt8(0, base + 2)                    // Palette
    dirEntries.writeUInt8(0, base + 3)                    // Reserved
    dirEntries.writeUInt16LE(1, base + 4)                 // Color planes
    dirEntries.writeUInt16LE(32, base + 6)                // Bits per pixel
    dirEntries.writeUInt32LE(pngs[i].length, base + 8)    // Size of image data
    dirEntries.writeUInt32LE(offset, base + 12)           // Offset
    offset += pngs[i].length
  })

  const ico = Buffer.concat([header, dirEntries, ...pngs])
  await writeFile(outPath, ico)
  console.log(`wrote ${outPath} (${ico.length} bytes)`)
}

async function main() {
  await mkdir(PUBLIC_DIR, { recursive: true })

  // Verify brand asset exists so misconfigured runs fail loud
  await readFile(BRAND_SVG)

  const svg192 = buildAnySvg({ size: 192, radius: 40, rocketScale: 0.82 })
  await writePng({ svg: svg192, size: 192, outPath: join(PUBLIC_DIR, 'icon-192.png') })

  const svg512 = buildAnySvg({ size: 512, radius: 104, rocketScale: 0.82 })
  await writePng({ svg: svg512, size: 512, outPath: join(PUBLIC_DIR, 'icon-512.png') })

  const svgMaskable = buildMaskableSvg({ size: 512 })
  await writePng({ svg: svgMaskable, size: 512, outPath: join(PUBLIC_DIR, 'icon-maskable-512.png') })

  // favicon.ico lives in src/app/ (App Router convention) and overrides icon.tsx
  // at the /favicon.ico route, so we regenerate it from the same brand source.
  const svgFavicon = buildAnySvg({ size: 64, radius: 12, rocketScale: 0.86 })
  await writeFavicon({ svg: svgFavicon, outPath: join(APP_DIR, 'favicon.ico') })

  console.log('PWA icons generated.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

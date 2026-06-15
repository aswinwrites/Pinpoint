/**
 * Icon generator script — run once to generate all PWA icons.
 * Requires: npm install -g sharp-cli  OR  use this with Node.js + sharp
 *
 * Usage: node public/generate-icons.js
 *
 * Alternatively, use https://favicon.io or https://maskable.app
 * to generate icons from a PNG source image.
 *
 * Required icon sizes:
 * 72, 96, 128, 144, 152, 180, 192, 384, 512
 *
 * Place the source image at public/icons/source.png (1024×1024, square)
 * then run this script.
 */

const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const SIZES = [72, 96, 128, 144, 152, 180, 192, 384, 512];
const SOURCE = path.join(__dirname, "icons", "source.png");
const OUTPUT_DIR = path.join(__dirname, "icons");

if (!fs.existsSync(SOURCE)) {
  console.error("❌ Missing source icon at public/icons/source.png");
  console.error("   Create a 1024×1024 PNG with your ParkPin logo.");
  process.exit(1);
}

async function generate() {
  for (const size of SIZES) {
    const outFile = path.join(OUTPUT_DIR, `icon-${size}.png`);
    await sharp(SOURCE).resize(size, size).png().toFile(outFile);
    console.log(`✓ ${outFile}`);
  }

  // Apple touch icon (180px)
  await sharp(SOURCE)
    .resize(180, 180)
    .png()
    .toFile(path.join(OUTPUT_DIR, "icon-apple-touch.png"));

  console.log("✓ All icons generated!");
}

generate().catch(console.error);

// Renders the Zendlijst app icons from one SVG mark: a Delft-blue tile with a
// white "Z" and a Dutch-orange dot (the same mark as the site header).
// Usage: node scripts/generate-icons.mjs
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

const BRAND = "#2b44b8";
const ACCENT = "#f26b21";

// "Z" drawn as a polygon so rendering does not depend on installed fonts.
// Shifted left so the "Z" plus dot is optically centred.
const MARK = `<g transform="translate(-22 0)">
  <polygon fill="#ffffff" points="120,128 340,128 340,184 196,328 340,328 340,384 120,384 120,328 264,184 120,184"/>
  <circle fill="${ACCENT}" cx="400" cy="356" r="36"/>
</g>`;

// Rounded tile for favicons and regular "any" icons.
const roundedSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="${BRAND}"/>${MARK}
</svg>`;

// Full-bleed tile with the mark scaled into the maskable safe zone (inner 80%).
// Also used for the Apple touch icon, which iOS rounds itself.
const fullBleedSvg = (scale) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${BRAND}"/>
  <g transform="translate(${256 * (1 - scale)} ${256 * (1 - scale)}) scale(${scale})">${MARK}</g>
</svg>`;

const png = (svg, size) => sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();

// ICO container with embedded PNGs (supported by every current browser).
const ico = (images) => {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + images.length * 16;
  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    return entry;
  });
  return Buffer.concat([header, ...entries, ...images.map(({ data }) => data)]);
};

await mkdir("public/icons", { recursive: true });

await writeFile("src/app/icon.svg", roundedSvg);
await writeFile("src/app/apple-icon.png", await png(fullBleedSvg(0.82), 180));
await writeFile("public/icons/icon-192.png", await png(roundedSvg, 192));
await writeFile("public/icons/icon-512.png", await png(roundedSvg, 512));
await writeFile("public/icons/icon-maskable-512.png", await png(fullBleedSvg(0.7), 512));

const icoSizes = [16, 32, 48];
const icoImages = await Promise.all(
  icoSizes.map(async (size) => ({ size, data: await png(roundedSvg, size) })),
);
await writeFile("src/app/favicon.ico", ico(icoImages));

console.log("Icons written to src/app and public/icons");

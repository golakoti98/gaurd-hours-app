import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const outDir = path.join(process.cwd(), "public", "icons");
await mkdir(outDir, { recursive: true });

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#064e3b"/>
  <path d="M256 96l-120 48v88c0 78 51 150 120 176 69-26 120-98 120-176v-88L256 96z" fill="#ffffff" opacity="0.95"/>
  <path d="M220 272l-28-28 18-18 10 10 52-52 18 18-70 70z" fill="#064e3b"/>
</svg>`;

const sizes = [
  ["icon-192.png", 192],
  ["icon-512.png", 512],
  ["icon-512-maskable.png", 512],
];

for (const [name, size] of sizes) {
  const buf = await sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();
  await writeFile(path.join(outDir, name), buf);
}

await writeFile(
  path.join(process.cwd(), "public", "favicon.ico"),
  await sharp(Buffer.from(svg)).resize(32, 32).png().toBuffer(),
);

console.log("Icons written to public/icons");

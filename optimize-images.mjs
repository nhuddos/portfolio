// optimize-images.mjs
//
// Converts the big PNG / JPG / GIF files in public/images to WebP, which is
// usually 3-10x smaller with no visible difference. Originals are kept
// next to the new files so you can compare (and delete them once happy).
//
// Usage (from the project root):
//   npm install --save-dev sharp
//   node optimize-images.mjs            # convert only, print the savings
//   node optimize-images.mjs --rewrite  # also point src/**/*.js(x) at the .webp files
//
// Photos/PNGs become lossy WebP (quality 82, max 1600px wide); GIFs become
// lossless animated WebP so the pixel art stays sharp.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const IMAGES_DIR = 'public/images';
const SRC_DIR = 'src';
const MAX_WIDTH = 1600;
const rewrite = process.argv.includes('--rewrite');

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]
  );

const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
const converted = []; // "/images/x/y.png" -> "/images/x/y.webp"
let before = 0;
let after = 0;

for (const file of walk(IMAGES_DIR)) {
  const ext = path.extname(file).toLowerCase();
  if (!['.png', '.jpg', '.jpeg', '.gif'].includes(ext)) continue;
  const out = file.slice(0, -ext.length) + '.webp';
  const isGif = ext === '.gif';

  const img = sharp(file, { animated: isGif });
  const { width } = await img.metadata();
  const pipeline = width && width > MAX_WIDTH ? img.resize({ width: MAX_WIDTH }) : img;
  await (isGif ? pipeline.webp({ lossless: true }) : pipeline.webp({ quality: 82 })).toFile(out);

  const a = fs.statSync(file).size;
  const b = fs.statSync(out).size;
  if (b >= a) {
    // Not actually smaller: keep the original and leave its path alone.
    fs.unlinkSync(out);
    console.log(`${file}  ${kb(a)} (WebP wasn't smaller, kept original)`);
    continue;
  }
  before += a;
  after += b;
  console.log(`${file}  ${kb(a)} -> ${kb(b)}`);
  converted.push([
    '/' + path.relative('public', file).split(path.sep).join('/'),
    '/' + path.relative('public', out).split(path.sep).join('/')
  ]);
}

console.log(`\nTotal: ${kb(before)} -> ${kb(after)}`);

if (rewrite && converted.length) {
  let touched = 0;
  for (const file of walk(SRC_DIR).filter((f) => /\.(js|jsx|ts|tsx|css|html)$/.test(f))) {
    let text = fs.readFileSync(file, 'utf8');
    let next = text;
    for (const [from, to] of converted) next = next.split(from).join(to);
    if (next !== text) {
      fs.writeFileSync(file, next);
      touched += 1;
      console.log(`updated references in ${file}`);
    }
  }
  console.log(`${touched} source file(s) updated.`);
} else if (converted.length) {
  console.log('Run again with --rewrite to update the paths in src/, or edit them by hand.');
}

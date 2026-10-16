import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'node_modules', '@ffmpeg', 'core', 'dist', 'umd');
const target = join(root, 'public', 'ffmpeg-core');

for (const name of ['ffmpeg-core.js', 'ffmpeg-core.wasm']) {
  const input = join(source, name);
  if (!existsSync(input)) throw new Error(`FFmpeg core asset is missing: ${input}`);
  mkdirSync(target, { recursive: true });
  copyFileSync(input, join(target, name));
}

const ffmpegWrapper = join(root, 'node_modules', '@ffmpeg', 'ffmpeg', 'dist', 'umd');
for (const name of ['ffmpeg.js', '814.ffmpeg.js']) {
  const input = join(ffmpegWrapper, name);
  if (!existsSync(input)) throw new Error(`FFmpeg wrapper asset is missing: ${input}`);
  copyFileSync(input, join(target, name));
}

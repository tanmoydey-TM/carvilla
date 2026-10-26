import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const local = resolve('.tools/python/imageio_ffmpeg/binaries');
const binary = process.env.FFMPEG_PATH || (existsSync(local) && resolve(local, readdirSync(local).find(name => name.endsWith('.exe')) || 'ffmpeg')) || 'ffmpeg';
const run = args => {
  const result = spawnSync(binary, ['-hide_banner', '-loglevel', 'error', '-threads', '1', ...args, '-y'], { stdio: 'inherit' });
  if (result.error || result.status !== 0) throw result.error || new Error('FFmpeg failed');
};
const manifest = [];
mkdirSync('public/media', { recursive: true });
for (let scene = 1; scene <= 3; scene++) {
  const input = `public/scene-${scene}.mp4`;
  const variants = {};
  for (const [name, fps, width] of [['desktop', 24, scene === 1 ? 1344 : 832], ['mobile', 24, 640]]) {
    const directory = `public/media/scene-${scene}/${name}`;
    mkdirSync(directory, { recursive: true });
    run(['-i', input, '-an', '-vf', `scale=${width}:-2`, '-fps_mode', 'passthrough', '-c:v', 'libwebp', '-quality', '76', '-compression_level', '4', '-start_number', '0', `${directory}/%04d.webp`]);
    variants[name] = { count: readdirSync(directory).filter(name => name.endsWith('.webp')).length, width, fps };
  }
  run(['-ss', scene === 1 ? '6' : '4', '-i', input, '-frames:v', '1', '-an', '-c:v', 'libwebp', '-quality', '90', `public/media/poster-${scene}.webp`]);
  manifest.push({ id: scene, ...variants });
}
writeFileSync('public/media/manifest.json', JSON.stringify(manifest, null, 2));
run(['-ss', '0.5', '-i', 'public/scene-2.mp4', '-frames:v', '1', '-an', '-c:v', 'libwebp', '-quality', '90', 'public/media/detail.webp']);
console.log('Prepared all three scenes:', manifest);

import { build } from 'esbuild';
import { readdir } from 'fs/promises';

const root = '../bot';
const workers = await readdir(`${root}/src/workers`);

build({
  entryPoints: [
    `${root}/src/main.ts`,
    ...workers.map((worker) => `${root}/src/workers/${worker}`),
  ],
  bundle: true,
  outdir: '../../dist/bot',
  platform: 'node',
  format: 'esm',
  loader: {
    '.ttf': 'file',
    '.node': 'file',
  },
  minify: true,
  sourcemap: true,
});

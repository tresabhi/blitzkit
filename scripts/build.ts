import { build } from 'esbuild';
import { readdir } from 'fs/promises';

const FILES = [
  'bot',
  'index',

  (await readdir('src/workers')).map(
    (file) => `workers/${file.replace('.ts', '')}`,
  ),
];

await build({
  entryPoints: FILES.map((file) => `src/${file}.ts`),
  outdir: 'dist/bot',

  platform: 'node',
  tsconfig: 'tsconfig.esbuild.json',
  loader: {
    '.node': 'copy',
    '.ttf': 'file',
  },
  format: 'cjs',
  jsx: 'transform',
  outExtension: {
    '.js': '.cjs',
  },

  bundle: true,
  sourcemap: true,
  minifyIdentifiers: false, // cause goofy errors
  minifySyntax: true,
  minifyWhitespace: true,

  logLevel: 'info',
});

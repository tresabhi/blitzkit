import { build } from 'esbuild';
import { rmSync } from 'fs';
import { argv } from 'process';

const isDev = argv.includes('--dev');

console.log('Removing dist...');
rmSync('dist', { recursive: true, force: true });

console.log('Building...');
build({
  entryPoints: ['src/index.ts'],
  outfile: 'dist/index.cjs',

  platform: 'node',
  loader: {
    '.node': 'copy',
    '.ttf': 'file',
  },

  bundle: isDev,
  sourcemap: isDev,
  minifyIdentifiers: false, // causes errors
  minifySyntax: isDev,
  minifyWhitespace: isDev,
});

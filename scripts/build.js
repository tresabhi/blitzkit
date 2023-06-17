import { build } from 'esbuild';
import { rmSync } from 'fs';
import { argv } from 'process';

const isDev = argv.includes('--dev');
const isProd = !isDev;

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

  bundle: true,
  sourcemap: isProd,
  minifyIdentifiers: false, // causes errors
  minifySyntax: isProd,
  minifyWhitespace: isProd,

  logLevel: isProd ? 'info' : 'silent',
});

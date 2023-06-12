import { build } from 'esbuild';
import { rmSync } from 'fs';

console.log('Removing dist...');
rmSync('dist', { recursive: true, force: true });

console.log('Creating context...');
build({
  entryPoints: ['src/index.ts'],
  outfile: 'dist/index.cjs',

  platform: 'node',
  loader: {
    '.node': 'copy',
    '.ttf': 'file',
  },

  bundle: true,
  sourcemap: true,
  minifyIdentifiers: false, // causes errors
  minifySyntax: true,
  minifyWhitespace: true,
});

import { build } from 'esbuild';

build({
  entryPoints: ['src/index.ts'],
  outfile: 'dist/server.cjs',

  platform: 'node',

  bundle: true,
  // minifying cases a few random errors; will investigate later
  // minify: true,
  sourcemap: true,

  loader: {
    '.node': 'copy',
    '.ttf': 'file',
  },
});

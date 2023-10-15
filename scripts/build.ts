import { build } from 'esbuild';

const FILES = ['bot', 'index'];

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

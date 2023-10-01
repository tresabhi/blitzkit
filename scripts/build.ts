import { build } from 'esbuild';

console.log('Building bot...');

await build({
  entryPoints: ['src/bot.ts'],
  outfile: 'dist/bot/index.cjs',

  platform: 'node',
  tsconfig: 'tsconfig.esbuild.json',
  loader: {
    '.node': 'copy',
    '.ttf': 'file',
  },
  format: 'cjs',
  jsx: 'transform',

  bundle: true,
  sourcemap: true,
  minifyIdentifiers: false, // cause goofy errors
  minifySyntax: true,
  minifyWhitespace: true,

  logLevel: 'info',
});

console.log('Built bot');

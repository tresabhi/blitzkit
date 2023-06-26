import { build } from 'esbuild';
import { rmSync } from 'fs';
import { argv } from 'process';

const isProd = !argv.includes('--dev');
const buildAll = argv.includes('--build=all');
const buildBot = argv.includes('--build=bot') | buildAll;
const buildServer = argv.includes('--build=server') | buildAll;

console.log('Removing dist...');
rmSync('dist', { recursive: true, force: true });

const commonOptions = {
  platform: 'node',
  loader: {
    '.node': 'copy',
    '.ttf': 'file',
  },

  bundle: true,
  sourcemap: true,
  minifyIdentifiers: false, // causes errors
  minifySyntax: isProd,
  minifyWhitespace: isProd,

  logLevel: isProd ? 'info' : 'silent',
};

console.log('Building...');
if (buildBot) {
  build({
    ...commonOptions,

    entryPoints: ['src/bot.ts'],
    outfile: 'dist/bot.cjs',
  });
}

if (buildServer) {
  build({
    ...commonOptions,

    entryPoints: ['src/server.ts'],
    outfile: 'dist/server.cjs',
  });
}

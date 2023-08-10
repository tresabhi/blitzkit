import { BuildOptions, build } from 'esbuild';
import { copyFile, mkdirSync, rmSync } from 'fs';
import { argv } from 'process';

const isProd = argv === undefined || !argv.includes('--dev');
const buildAll = argv === undefined || argv.includes('--build=all');
const buildBot = argv?.includes('--build=bot') || buildAll;
const buildServer = argv?.includes('--build=server') || buildAll;

if (isProd) {
  // only remove in production to ensure no time is wasted in dev
  console.log('Removing dist...');
  rmSync('dist', { recursive: true, force: true });
  console.log('Dist removed');

  console.log('Creating dist...');
  mkdirSync('dist');
  console.log('Dist created');

  console.log('Copying package.json...');
  copyFile('package.dist.json', 'dist/package.json', () =>
    console.log('package.json copied'),
  );
}

const commonOptions: BuildOptions = {
  platform: 'node',
  loader: {
    '.node': 'copy',
    '.ttf': 'file',
  },
  format: 'cjs',

  bundle: true,
  sourcemap: true,
  minifyIdentifiers: false, // causes errors
  minifySyntax: isProd,
  minifyWhitespace: isProd,

  logLevel: isProd ? 'info' : 'silent',
};

if (buildBot) {
  console.log('Building bot...');
  build({
    ...commonOptions,

    entryPoints: ['src/bot.ts'],
    outfile: 'dist/bot.cjs',
  }).then(() => console.log('Bot built'));
}

if (buildServer) {
  console.log('Building server...');
  build({
    ...commonOptions,

    entryPoints: ['src/server.ts'],
    outfile: 'dist/server.cjs',
  }).then(() => {
    console.log('Server built');
  });
}

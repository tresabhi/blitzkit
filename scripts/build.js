import { build } from 'esbuild';
import { copyFile, mkdir, rm, writeFile } from 'fs/promises';
import { argv } from 'process';

const isProd = !argv.includes('--dev');
const buildAll = argv.includes('--build=all');
const buildBot = argv.includes('--build=bot') | buildAll;
const buildServer = argv.includes('--build=server') | buildAll;

if (isProd) {
  // only remove in production to ensure no time is wasted in dev
  console.log('🟡 Removing dist...');
  await rm('dist', { recursive: true, force: true });
  console.log('✅ Dist removed');

  console.log('🟡 Creating dist...');
  await mkdir('dist');
  console.log('✅ Dist created');

  console.log('🟡 Caching tankopedia...');
  fetch('https://www.blitzstars.com/bs-tankopedia.json')
    .then((response) => response.text())
    .then((tankopedia) => writeFile('./dist/tankopedia.json', tankopedia))
    .then(() => console.log('✅ Tankopedia cached'));

  console.log('🟡 Caching tank averages...');
  fetch('https://www.blitzstars.com/api/tankaverages.json')
    .then((response) => response.json())
    .then((individualTankAverages) => {
      const tankAverages = {};

      individualTankAverages.forEach((individualTankAverage) => {
        tankAverages[individualTankAverage.tank_id] = individualTankAverage;
      });

      return writeFile(
        './dist/tankaverages.json',
        JSON.stringify(tankAverages),
      );
    })
    .then(() => console.log('✅ Tank averages cached'));

  console.log('🟡 Copying package.json...');
  copyFile('package.dist.json', 'dist/package.json').then(() =>
    console.log('✅ package.json copied'),
  );
}

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

if (buildBot) {
  console.log('🟡 Building bot...');
  build({
    ...commonOptions,

    entryPoints: ['src/bot.ts'],
    outfile: 'dist/bot.cjs',
  }).then(() => {
    console.log('✅ Bot built');
  });
}

if (buildServer) {
  console.log('🟡 Building server...');
  build({
    ...commonOptions,

    entryPoints: ['src/server.ts'],
    outfile: 'dist/server.cjs',
  }).then(() => {
    console.log('✅ Server built');
  });
}

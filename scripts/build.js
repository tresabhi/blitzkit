import { build } from 'esbuild';
import { argv } from 'process';

const targetFile = argv
  .find((arg) => arg.startsWith('--build='))
  ?.split('=')[1];
const files = targetFile ? [targetFile] : ['bot', 'server'];

files.forEach(async (file) => {
  console.log(`Building ${file}...`);

  await build({
    entryPoints: [`src/${file}.ts`],
    outfile: `dist/${file}/index.cjs`,

    platform: 'node',
    loader: {
      '.node': 'copy',
      '.ttf': 'file',
    },
    format: 'cjs',

    bundle: true,
    sourcemap: true,
    minifyIdentifiers: false, // cause goofy errors
    minifySyntax: true,
    minifyWhitespace: true,

    logLevel: 'info',
  });

  console.log(`Built ${file}`);
});

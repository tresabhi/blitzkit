import { build } from 'esbuild';
import { argv } from 'process';

const targetFile = argv
  .find((arg) => arg.startsWith('--build='))
  ?.split('=')[1];
const files = targetFile ? [targetFile] : ['bot', 'server'];

// copyFile('package.dist.json', 'dist/package.json', () =>
//   console.log('package.json copied'),
// );

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
    minify: true,

    logLevel: 'info',
  });

  console.log(`Built ${file}`);
});

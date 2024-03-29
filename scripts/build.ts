import { exec } from 'child_process';
import { build } from 'esbuild';
import { cp, readdir } from 'fs/promises';
import { argv } from 'process';
import { promisify } from 'util';

const execPromise = promisify(exec);
const isProduction = argv.includes('--production');

await readdir('src/workers').then((workers) => {
  const files = [
    'bot',
    'index',

    ...workers.map((file) => `workers/${file.replace('.ts', '')}`),
  ];

  build({
    entryPoints: files.map((file) => `src/${file}.ts`),
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

    external: ['sharp'],
    bundle: true,
    sourcemap: true,
    minifyIdentifiers: false, // causes goofy errors
    minifySyntax: true,
    minifyWhitespace: true,

    logLevel: 'info',
  });
});

// copy schema.prisma
await cp('prisma/schema.prisma', 'dist/bot/schema.prisma');
await readdir('node_modules/prisma').then((files) =>
  files
    .filter((file) => file.endsWith('.node'))
    .map((file) => cp(`node_modules/prisma/${file}`, `dist/bot/${file}`)),
);

if (isProduction) {
  // install fixed sharp
  console.log('Installing fixed sharp...');
  await execPromise('yarn init -y && yarn add sharp@0.33.1 --ignore-engines', {
    cwd: 'dist/bot',
  });
}

console.log('Generated:', await readdir('dist/bot'));

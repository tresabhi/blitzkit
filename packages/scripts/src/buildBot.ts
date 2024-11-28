import { build } from 'esbuild';
import { cp, readdir, rm } from 'fs/promises';

const srcRoot = '../bot';
const distRoot = '../../dist/bot';
const modulesRoot = '../../node_modules';
const workers = await readdir(`${srcRoot}/src/workers`);

await rm(distRoot, { recursive: true, force: true });

build({
  entryPoints: [
    `${srcRoot}/src/main.ts`,
    ...workers.map((worker) => `${srcRoot}/src/workers/${worker}`),
  ],
  bundle: true,
  outdir: '../../dist/bot',
  platform: 'node',
  format: 'esm',
  loader: {
    '.ttf': 'file',
    '.node': 'empty',
  },
  minify: true,
  sourcemap: true,
});

await Promise.all(
  (await readdir(`${modulesRoot}/@resvg`)).map(async (module) => {
    const files = await readdir(`${modulesRoot}/@resvg/${module}`).then(
      (files) => files.filter((file) => file.endsWith('.node')),
    );

    await Promise.all(
      files.map(async (file) => {
        await cp(
          `${modulesRoot}/@resvg/${module}/${file}`,
          `${distRoot}/workers/${file}`,
        );
      }),
    );
  }),
);

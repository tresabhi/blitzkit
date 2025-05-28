import { exec as execSync } from 'child_process';
import { existsSync } from 'fs';
import { readdir, rm, writeFile } from 'fs/promises';
import { chunk } from 'lodash-es';
import { promisify } from 'util';

const exec = promisify(execSync);

let executableFileExtension: string;

if (existsSync('node_modules/.bin/protoc-gen-ts_proto.exe')) {
  executableFileExtension = '.exe';
} else {
  executableFileExtension = '';
}

// await compile('packages/core/src/protos');
await compile('submodules/blitzkit-closed/src/unreal/protos');

async function compile(root: string) {
  const filesRaw = await readdir(root);

  for (const file of filesRaw) {
    if (!file.endsWith('.ts')) continue;
    await rm(`${root}/${file}`);
  }

  const allFiles = filesRaw.filter(
    (file) => file.endsWith('.proto') && !file.startsWith('_'),
  );

  for (const files of chunk(allFiles, 32)) {
    const args = [
      `-I=${root}`,
      `--plugin=./node_modules/.bin/protoc-gen-ts_proto${executableFileExtension}`,
      '--ts_proto_opt=esModuleInterop=true',
      '--ts_proto_opt=oneof=unions-value',
      // '--ts_proto_opt=removeEnumPrefix=true',
      '--ts_proto_opt=unrecognizedEnum=false',
      '--ts_proto_opt=snakeToCamel=false',
      `--ts_proto_out=${root}`,
      ...files.map((file) => `${root}/${file}`),
    ];

    await exec(`protoc ${args.join(' ')}`);
  }

  await writeFile(
    `${root}/index.ts`,
    '// @ts-nocheck\n' +
      allFiles
        .sort()
        .map((file) => file.replace('.proto', ''))
        .map((file) => `export * from './${file}.ts';`)
        .join('\n'),
  );
}

import { exec as execSync } from 'child_process';
import { existsSync } from 'fs';
import { readdir, rm, writeFile } from 'fs/promises';
import { promisify } from 'util';

const ROOT = 'packages/core/src/protos';

const exec = promisify(execSync);

let executableFileExtension: string;

if (existsSync('node_modules/.bin/protoc-gen-ts_proto.exe')) {
  executableFileExtension = '.exe';
} else {
  executableFileExtension = '';
}

const filesRaw = await readdir(`${ROOT}`);
await Promise.all(
  filesRaw.map(async (file) => {
    if (!file.endsWith('.proto')) {
      await rm(`${ROOT}/${file}`);
    }
  }),
);

const files = filesRaw.filter((file) => file.endsWith('.proto'));
const args = [
  `--plugin=./node_modules/.bin/protoc-gen-ts_proto${executableFileExtension}`,
  '--ts_proto_opt=esModuleInterop=true',
  '--ts_proto_opt=oneof=unions-value',
  '--ts_proto_opt=removeEnumPrefix=true',
  '--ts_proto_opt=unrecognizedEnum=false',
  '--ts_proto_opt=snakeToCamel=false',
  '--ts_proto_out=.',
  ...files.map((file) => `${ROOT}/${file}`),
];

await exec(`protoc ${args.join(' ')}`);
await writeFile(
  `${ROOT}/index.ts`,
  files
    .map((file) => file.replace('.proto', ''))
    .map((file) => `export * from './${file}.ts';`)
    .join('\n'),
);

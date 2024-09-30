import { exec as execSync } from 'child_process';
import { existsSync } from 'fs';
import { mkdir, readdir, rm } from 'fs/promises';
import { promisify } from 'util';

const ROOT = 'packages/core/src/protos';

const exec = promisify(execSync);

let executableFileExtension: string;

if (existsSync('node_modules/.bin/protoc-gen-ts.exe')) {
  executableFileExtension = '.exe';
} else {
  executableFileExtension = '';
}

const files = await readdir(`${ROOT}/raw`);
const args = [
  `--plugin="protoc-gen-ts=./node_modules/.bin/protoc-gen-ts${executableFileExtension}"`,
  '--ts_opt=esModuleInterop=true',
  `--js_out="import_style=commonjs,binary:."`,
  `--ts_out="."`,
  ...files.map((file) => `${ROOT}/raw/${file}`),
];

await rm(`${ROOT}/generated`, { recursive: true, force: true });
await rm(`temp/protos`, { recursive: true, force: true });
await mkdir(`${ROOT}/generated`, { recursive: true });
await mkdir(`temp/protos`, { recursive: true });
await exec(`protoc ${args.join(' ')}`);
// await cp(`${ROOT}/generated/${ROOT}/raw`, `${ROOT}/generated`, {
//   recursive: true,
// });
// await rm(`${ROOT}/generated/packages`, { recursive: true, force: true });

// await writeFile(
//   `${ROOT}/generated/index.ts`,
//   files
//     .map((file) => file.replace('.proto', ''))
//     .map((file) => `export * from './${file}_pb';`)
//     .join('\n'),
// );

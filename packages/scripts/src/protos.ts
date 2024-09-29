import { $ } from 'bun';
import { readdir } from 'fs/promises';

const ROOT = 'packages/core/protos';

const files = await readdir(`${ROOT}/raw`);
const args = [
  '--plugin="./node_modules/.bin/protoc-gen-ts"',
  '--js_out="import_style=commonjs,binary:${OUT_DIR}"',
  `--ts_out="${ROOT}/generated"`,
  ...files.map((file) => `${ROOT}/raw/${file}`),
];

console.log(`protoc ${args.join(' ')}`);

console.log(await $`protoc ${args.join(' ')}`.text());

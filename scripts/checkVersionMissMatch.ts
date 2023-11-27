import { readdir } from 'fs/promises';
import packageJSON from '../package.json';

const { version } = packageJSON;
const changelogs = await readdir('docs/changelogs');
const hasVersion = changelogs.includes(`${version}.md`);

if (hasVersion) {
  console.log(`Version ${version} found in changelogs`);
} else {
  throw new Error(`Version ${version} not found in changelogs`);
}

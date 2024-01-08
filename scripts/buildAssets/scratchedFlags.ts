import { readdir } from 'fs/promises';
import { DATA, DOI } from '.';
import { readBase64DVPL } from '../../src/core/blitz/readBase64DVPL';
import commitMultipleFiles, {
  FileChange,
} from '../../src/core/blitzkrieg/commitMultipleFiles';

export async function buildScratchedFlags() {
  console.log('Building scratched flags...');

  const flags = await readdir(`${DATA}/${DOI.flags}`);

  console.log('Committing scratched flags...');
  commitMultipleFiles(
    'tresabhi',
    'blitzkrieg-assets',
    'main',
    'scratched flags',
    await Promise.all(
      flags
        .filter(
          (flag) =>
            flag.startsWith('flag_tutor-tank_') &&
            !flag.endsWith('@2x.packed.webp.dvpl'),
        )
        .map(async (flag) => {
          const content = await readBase64DVPL(`${DATA}/${DOI.flags}/${flag}`);
          const name = flag.match(/flag_tutor-tank_(.+)\.packed\.webp/)![1];

          return {
            content,
            encoding: 'base64',
            path: `flags/scratched/${name}.webp`,
          } satisfies FileChange;
        }),
    ),
    true,
  );
}

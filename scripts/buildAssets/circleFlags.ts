import { readdir } from 'fs/promises';
import { DATA, DOI } from '.';
import { readBase64DVPL } from '../../src/core/blitz/readBase64DVPL';
import commitMultipleFiles, {
  FileChange,
} from '../../src/core/blitzkrieg/commitMultipleFiles';

export async function circleFlags() {
  const flags = await readdir(`${DATA}/${DOI.flags}`);

  commitMultipleFiles(
    'tresabhi',
    'blitzkrieg-assets',
    'main',
    'circle flags',
    await Promise.all(
      flags
        .filter(
          (flag) =>
            flag.startsWith('flag_profile-stat_') &&
            !flag.endsWith('@2x.packed.webp.dvpl'),
        )
        .map(async (flag) => {
          const content = await readBase64DVPL(`${DATA}/${DOI.flags}/${flag}`);
          const name = flag.match(/flag_profile-stat_(.+)\.packed\.webp/)![1];

          return {
            content,
            encoding: 'base64',
            path: `flags/circle/${name}.webp`,
          } satisfies FileChange;
        }),
    ),
    true,
  );
}

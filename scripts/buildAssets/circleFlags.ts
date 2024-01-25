import { readdir } from 'fs/promises';
import { readBase64DVPL } from '../../src/core/blitz/readBase64DVPL';
import { commitAssets } from '../../src/core/blitzkrieg/commitAssets';
import { FileChange } from '../../src/core/blitzkrieg/commitMultipleFiles';
import { DATA, POI } from './constants';

export async function circleFlags(production: boolean) {
  const flags = await readdir(`${DATA}/${POI.flags}`);
  const changes = await Promise.all(
    flags
      .filter(
        (flag) =>
          flag.startsWith('flag_profile-stat_') &&
          !flag.endsWith('@2x.packed.webp.dvpl'),
      )
      .map(async (flag) => {
        const content = await readBase64DVPL(`${DATA}/${POI.flags}/${flag}`);
        const name = flag.match(/flag_profile-stat_(.+)\.packed\.webp/)![1];

        return {
          content,
          encoding: 'base64',
          path: `flags/circle/${name}.webp`,
        } satisfies FileChange;
      }),
  );

  await commitAssets('circle flags', changes, production);
}

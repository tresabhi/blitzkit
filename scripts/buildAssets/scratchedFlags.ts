import { readdir } from 'fs/promises';
import { readBase64DVPL } from '../../src/core/blitz/readBase64DVPL';
import { commitAssets } from '../../src/core/blitzkit/commitAssets';
import { FileChange } from '../../src/core/blitzkit/commitMultipleFiles';
import { DATA } from './constants';

export async function scratchedFlags(production: boolean) {
  console.log('Building scratched flags...');

  const flags = await readdir(`${DATA}/Gfx/Lobby/flags`);
  const changes = await Promise.all(
    flags
      .filter(
        (flag) =>
          flag.startsWith('flag_tutor-tank_') &&
          !flag.endsWith('@2x.packed.webp.dvpl'),
      )
      .map(async (flag) => {
        const content = await readBase64DVPL(`${DATA}/Gfx/Lobby/flags/${flag}`);
        const name = flag.match(/flag_tutor-tank_(.+)\.packed\.webp/)![1];

        return {
          content,
          encoding: 'base64',
          path: `flags/scratched/${name}.webp`,
        } satisfies FileChange;
      }),
  );

  await commitAssets('scratched flags', changes, production);
}

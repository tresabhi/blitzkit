import { readdir } from 'fs/promises';
import sharp from 'sharp';
import { readBase64DVPL } from '../../src/core/blitz/readBase64DVPL';
import { readDVPLFile } from '../../src/core/blitz/readDVPLFile';
import { commitAssets } from '../../src/core/blitzkit/commitAssets';
import { FileChange } from '../../src/core/blitzkit/commitMultipleFiles';
import { DATA } from './constants';

export async function flags() {
  console.log('Building flags...');

  const changes = [
    ...(await Promise.all(
      (await readdir(`${DATA}/Gfx/Lobby/flags`))
        .filter(
          (flag) =>
            flag.startsWith('flag_profile-stat_') &&
            !flag.endsWith('@2x.packed.webp.dvpl'),
        )
        .map(async (flag) => {
          const image = sharp(
            await readDVPLFile(`${DATA}/Gfx/Lobby/flags/${flag}`),
          );
          const content = (
            await image.trim({ threshold: 100 }).toBuffer()
          ).toString('base64');
          const name = flag.match(/flag_profile-stat_(.+)\.packed\.webp/)![1];

          return {
            content,
            encoding: 'base64',
            path: `flags/circle/${name}.webp`,
          } satisfies FileChange;
        }),
    )),
    ...(await Promise.all(
      (await readdir(`${DATA}/Gfx/Lobby/flags`))
        .filter(
          (flag) =>
            flag.startsWith('flag_tutor-tank_') &&
            !flag.endsWith('@2x.packed.webp.dvpl'),
        )
        .map(async (flag) => {
          const content = await readBase64DVPL(
            `${DATA}/Gfx/Lobby/flags/${flag}`,
          );
          const name = flag.match(/flag_tutor-tank_(.+)\.packed\.webp/)![1];

          return {
            content,
            encoding: 'base64',
            path: `flags/scratched/${name}.webp`,
          } satisfies FileChange;
        }),
    )),
    ...(await Promise.all(
      (await readdir(`${DATA}/Gfx/Lobby/flags`))
        .filter(
          (flag) =>
            flag.startsWith('flag_filter_') &&
            flag.endsWith('@2x.packed.webp.dvpl'),
        )
        .map(async (flag) => {
          const content = (
            await sharp(await readDVPLFile(`${DATA}/Gfx/Lobby/flags/${flag}`))
              .trim({
                threshold: 100,
                background: { r: 0, g: 0, b: 0, alpha: 0 },
              })
              .toBuffer()
          ).toString('base64');
          const name = flag.match(/flag_filter_(.+)@2x\.packed\.webp/)![1];

          return {
            content,
            encoding: 'base64',
            path: `flags/fade_small/${name}.webp`,
          } satisfies FileChange;
        }),
    )),
  ];

  await commitAssets('flags', changes);
}

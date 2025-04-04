import { readdir } from 'fs/promises';
import sharp from 'sharp';
import { readDVPLFile } from '../../src/core/blitz/readDVPLFile';
import { commitAssets } from '../core/github/commitAssets';
import { FileChange } from '../core/github/commitMultipleFiles';
import { DATA } from './constants';

export async function moduleIcons() {
  console.log('Building module icons...');

  const changes = await Promise.all(
    (await readdir(`${DATA}/Gfx/UI/ModulesTechTree`))
      .filter(
        (file) =>
          !file.endsWith('@2x.packed.webp') && file.startsWith('vehicle'),
      )
      .map(async (file) => {
        const nameRaw = file.match(/vehicle(.+)\.packed\.webp/)![1];
        const name = nameRaw[0].toLowerCase() + nameRaw.slice(1);
        const content = await sharp(
          await readDVPLFile(`${DATA}/Gfx/UI/ModulesTechTree/${file}`),
        )
          .trim()
          .toBuffer();

        return {
          content,
          path: `icons/modules/${name}.webp`,
        } satisfies FileChange;
      }),
  );

  await commitAssets('module icons', changes);
}

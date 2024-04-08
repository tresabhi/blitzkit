import { readdir } from 'fs/promises';
import sharp from 'sharp';
import { readDVPLFile } from '../../src/core/blitz/readDVPLFile';
import { commitAssets } from '../../src/core/blitzkrieg/commitAssets';
import { FileChange } from '../../src/core/blitzkrieg/commitMultipleFiles';
import { DATA, POI } from './constants';

export async function moduleIcons(production: boolean) {
  console.log('Building module icons...');

  const changes = await Promise.all(
    (await readdir(`${DATA}/${POI.moduleIcons}`))
      .filter(
        (file) =>
          !file.endsWith('@2x.packed.webp.dvpl') && file.startsWith('vehicle'),
      )
      .map(async (file) => {
        const nameRaw = file.match(/vehicle(.+)\.packed\.webp\.dvpl/)![1];
        const name = nameRaw[0].toLowerCase() + nameRaw.slice(1);
        const content = (
          await sharp(await readDVPLFile(`${DATA}/${POI.moduleIcons}/${file}`))
            .trim()
            .toBuffer()
        ).toString('base64');

        return {
          content,
          path: `icons/modules/${name}.webp`,
          encoding: 'base64',
        } satisfies FileChange;
      }),
  );

  await commitAssets('module icons', changes, production);
}

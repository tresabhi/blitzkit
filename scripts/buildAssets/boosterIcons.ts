import { readdir } from 'fs/promises';
import sharp from 'sharp';
import { readDVPLFile } from '../../src/core/blitz/readDVPLFile';
import { readStringDVPL } from '../../src/core/blitz/readStringDVPL';
import { commitAssets } from '../../src/core/blitzkrieg/commitAssets';
import { FileChange } from '../../src/core/blitzkrieg/commitMultipleFiles';
import { DATA, POI } from './constants';

export async function boosterIcons(production: boolean) {
  const boosterFiles = (await readdir(`${DATA}/${POI.boosterIcons}`)).filter(
    (file) => !file.endsWith('@2x.txt.dvpl') && !file.startsWith('texture0'),
  );
  const image = sharp(
    await readDVPLFile(`${DATA}/${POI.boosterIcons}/texture0.packed.webp.dvpl`),
  );
  const changes: FileChange[] = [];

  await Promise.all(
    boosterFiles.map(async (file) => {
      const name = file.match(/booster_(.+).txt.dvpl/)![1];
      const sizes = (
        await readStringDVPL(`${DATA}/${POI.boosterIcons}/${file}`)
      )
        .split('\n')[4]
        .split(' ')
        .map(Number);
      const content = (
        await image
          .clone()
          .extract({
            left: sizes[0],
            top: sizes[1],
            width: sizes[2],
            height: sizes[3],
          })
          .toBuffer()
      ).toString('base64');

      changes.push({
        path: `icons/boosters/${name}.webp`,
        content,
        encoding: 'base64',
      });
    }),
  );

  await commitAssets('booster icons', changes, production);
}

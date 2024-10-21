import { readdir } from 'fs/promises';
import sharp from 'sharp';
import { readDVPLFile } from '../../src/core/blitz/readDVPLFile';
import { readStringDVPL } from '../../src/core/blitz/readStringDVPL';
import { commitAssets } from '../core/github/commitAssets';
import { FileChange } from '../core/github/commitMultipleFiles';
import { DATA } from './constants';

export async function boosterIcons() {
  const boosterFiles = (await readdir(`${DATA}/Gfx/Shared/boosters`)).filter(
    (file) => !file.endsWith('@2x.txt.dvpl') && !file.startsWith('texture0'),
  );
  const image = sharp(
    await readDVPLFile(`${DATA}/Gfx/Shared/boosters/texture0.packed.webp.dvpl`),
  );
  const changes: FileChange[] = [];

  await Promise.all(
    boosterFiles.map(async (file) => {
      const name = file.match(/booster_(.+).txt.dvpl/)?.[1];

      if (name === undefined) return;

      const sizes = (
        await readStringDVPL(`${DATA}/Gfx/Shared/boosters/${file}`)
      )
        .split('\n')[4]
        .split(' ')
        .map(Number);
      const content = await image
        .clone()
        .extract({
          left: sizes[0],
          top: sizes[1],
          width: sizes[2],
          height: sizes[3],
        })
        .toBuffer();

      changes.push({
        path: `icons/boosters/${name}.webp`,
        content,
      });
    }),
  );

  await commitAssets('booster icons', changes);
}

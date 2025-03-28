import { readdir } from 'fs/promises';
import sharp from 'sharp';
import { readDVPLFile } from '../../src/core/blitz/readDVPLFile';
import { readStringDVPL } from '../../src/core/blitz/readStringDVPL';
import { commitAssets } from '../core/github/commitAssets';
import { FileChange } from '../core/github/commitMultipleFiles';
import { DATA } from './constants';

export async function shellIcons() {
  console.log('Building shell icons...');

  const image = sharp(
    await readDVPLFile(
      `${DATA}/Gfx/Shared/tank-supply/ammunition/big/texture0.packed.webp`,
    ),
  );

  const changes = await Promise.all(
    (await readdir(`${DATA}/Gfx/Shared/tank-supply/ammunition/big`))
      .filter((file) => file.endsWith('_l.txt'))
      .map(async (file) => {
        const name = file.match(/(.+)_l\.txt/)![1];
        const sizes = (
          await readStringDVPL(
            `${DATA}/Gfx/Shared/tank-supply/ammunition/big/${file}`,
          )
        )
          .split('\n')[4]
          .split(' ')
          .map(Number);

        return {
          content: await image
            .clone()
            .extract({
              left: sizes[0],
              top: sizes[1],
              width: sizes[2],
              height: sizes[3],
            })
            .toBuffer(),
          path: `icons/shells/${name}.webp`,
        } satisfies FileChange;
      }),
  );

  await commitAssets('shell icons', changes);
}

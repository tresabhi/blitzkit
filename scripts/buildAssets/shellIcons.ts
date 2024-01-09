import { readdir } from 'fs/promises';
import sharp from 'sharp';
import { readDVPLFile } from '../../src/core/blitz/readDVPLFile';
import { readStringDVPL } from '../../src/core/blitz/readStringDVPL';
import commitMultipleFiles, {
  FileChange,
} from '../../src/core/blitzkrieg/commitMultipleFiles';
import { DATA, DOI } from './constants';

export async function buildShellIcons() {
  console.log('Building shell icons...');

  const image = sharp(
    await readDVPLFile(
      `${DATA}/${DOI.bigShellIcons}/texture0.packed.webp.dvpl`,
    ),
  );

  const changes = await Promise.all(
    (await readdir(`${DATA}/${DOI.bigShellIcons}`))
      .filter((file) => file.endsWith('_l.txt.dvpl'))
      .map(async (file) => {
        const name = file.match(/(.+)_l\.txt\.dvpl/)![1];
        const sizes = (
          await readStringDVPL(`${DATA}/${DOI.bigShellIcons}/${file}`)
        )
          .split('\n')[4]
          .split(' ')
          .map(Number);

        return {
          content: (
            await image
              .clone()
              .extract({
                left: sizes[0],
                top: sizes[1],
                width: sizes[2],
                height: sizes[3],
              })
              .toBuffer()
          ).toString('base64'),
          encoding: 'base64',
          path: `icons/shells/${name}.webp`,
        } satisfies FileChange;
      }),
  );

  console.log('Committing shell icons...');
  commitMultipleFiles(
    'tresabhi',
    'blitzkrieg-assets',
    'main',
    'shell icons',
    changes,
    true,
  );
}

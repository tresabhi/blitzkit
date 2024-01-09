import { readdir } from 'fs/promises';
import { readBase64DVPL } from '../../src/core/blitz/readBase64DVPL';
import commitMultipleFiles, {
  FileChange,
} from '../../src/core/blitzkrieg/commitMultipleFiles';
import { DATA, DOI } from './constants';

export async function buildModuleIcons() {
  console.log('Building module icons...');

  const changes = await Promise.all(
    (await readdir(`${DATA}/${DOI.moduleIcons}`))
      .filter(
        (file) =>
          !file.endsWith('@2x.packed.webp.dvpl') && file.startsWith('vehicle'),
      )
      .map(async (file) => {
        const nameRaw = file.match(/vehicle(.+)\.packed\.webp\.dvpl/)![1];
        const name = nameRaw[0].toLowerCase() + nameRaw.slice(1);
        const content = await readBase64DVPL(
          `${DATA}/${DOI.moduleIcons}/${file}`,
        );

        return {
          content,
          path: `icons/modules/${name}.webp`,
          encoding: 'base64',
        } satisfies FileChange;
      }),
  );

  console.log('Committing module icons...');
  commitMultipleFiles(
    'tresabhi',
    'blitzkrieg-assets',
    'main',
    'module icons',
    changes,
    true,
  );
}

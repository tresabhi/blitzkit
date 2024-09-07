import { readDVPLFile } from '../../src/core/blitz/readDVPLFile';
import { commitAssets } from '../../src/core/blitzkit/commitAssets';
import { FileChange } from '../../src/core/blitzkit/commitMultipleFiles';
import { DATA } from './constants';

export async function camouflageIcons() {
  console.log('Building camouflage icons...');
  const content = await readDVPLFile(
    `${DATA}/Gfx/UI/Hangar/IconCamouflage.packed.webp.dvpl`,
  ).then((content) => content.toString('base64'));
  const changes: FileChange[] = [
    {
      content,
      encoding: 'base64',
      path: 'icons/camo.webp',
    },
  ];

  await commitAssets('camo icons', changes);
}

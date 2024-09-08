import { readDVPLFile } from '../../src/core/blitz/readDVPLFile';
import { commitAssets } from '../core/github/commitAssets';
import { FileChange } from '../core/github/commitMultipleFiles';
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

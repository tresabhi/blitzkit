import sharp from 'sharp';
import { readDVPLFile } from '../../src/core/blitz/readDVPLFile';
import { commitAssets } from '../../src/core/blitzrinth/commitAssets';
import { FileChange } from '../../src/core/blitzrinth/commitMultipleFiles';
import { DATA } from './constants';

const ICONS = [
  ['currency_silver_m.packed.webp', 'silver'],
  ['currency_premium_xl.packed.webp', 'premium'],
  ['currency_gold_m.packed.webp', 'gold'],
  ['currency_free-xp_xl.packed.webp', 'free-xp'],
  ['currency_elite-xp_xl.packed.webp', 'elite-xp'],
  ['currency_crew-xp_xl.packed.webp', 'crew-xp'],
  ['currency_battle-xp_xl.packed.webp', 'xp'],
];

export async function currencies(production: boolean) {
  console.log('Building currency icons...');

  const changes = await Promise.all(
    ICONS.map(async ([file, name]) => {
      const content = (
        await sharp(
          await readDVPLFile(`${DATA}/Gfx/Lobby/currency/${file}.dvpl`),
        )
          .trim()
          .toBuffer()
      ).toString('base64');

      return {
        content,
        encoding: 'base64',
        path: `icons/currencies/${name}.webp`,
      } satisfies FileChange;
    }),
  );

  await commitAssets('currency icons', changes, production);
}

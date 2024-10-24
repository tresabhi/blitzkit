import { assertSecret, BlitzGlossary } from '@blitzkit/core';
import sharp from 'sharp';
import { readDVPLFile } from '../../src/core/blitz/readDVPLFile';
import { commitAssets } from '../core/github/commitAssets';
import { FileChange } from '../core/github/commitMultipleFiles';
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

export async function currencies() {
  console.log('Building currency icons...');

  const changes: FileChange[] = [];

  await Promise.all(
    ICONS.map(async ([file, name]) => {
      const content = await sharp(
        await readDVPLFile(`${DATA}/Gfx/Lobby/currency/${file}.dvpl`),
      )
        .trim()
        .toBuffer();

      changes.push({
        content,
        path: `icons/currencies/${name}.webp`,
      });
    }),
  );

  const glossary = await fetch(assertSecret(process.env.WOTB_GLOSSARY)).then(
    (response) => response.json() as Promise<BlitzGlossary>,
  );

  await Promise.all(
    Object.entries(glossary)
      .filter(([key]) => /^prx_season_\d+$/.test(key))
      .map(async ([key, item]) => {
        if (item.image_url === null) throw new Error(`No image_url for ${key}`);

        const imageRaw = await fetch(item.image_url).then((response) =>
          response.arrayBuffer(),
        );
        const content = await sharp(imageRaw)
          .trim({
            threshold: 100,
            background: { r: 0, g: 0, b: 0, alpha: 0 },
          })
          .toBuffer();

        changes.push({
          content,
          path: `icons/currencies/${key}.webp`,
        });
      }),
  );

  await commitAssets('currency icons', changes);
}

import sharp from 'sharp';
import { readDVPLFile } from '../../src/core/blitz/readDVPLFile';
import { readStringDVPL } from '../../src/core/blitz/readStringDVPL';
import { readXMLDVPL } from '../../src/core/blitz/readXMLDVPL';
import { readYAMLDVPL } from '../../src/core/blitz/readYAMLDVPL';
import commitMultipleFiles, {
  FileChange,
} from '../../src/core/blitzkrieg/commitMultipleFiles';
import { DATA, POI } from './constants';
import { ConsumablesCommon } from './definitions';

interface Mappings {
  Header: { version: number };
  StyleSheets: {
    selectors: string[];
    properties: { 'bg-sprite': string };
  }[];
}

export async function buildConsumableIcons() {
  console.log('Building consumable icons...');

  const changes: FileChange[] = [];
  // const files = await readdir(`${DATA}/${POI.consumableIcons}`);
  const texture = sharp(
    await readDVPLFile(
      `${DATA}/${POI.consumableIcons}/texture0.packed.webp.dvpl`,
    ),
  );
  // const consumablesCommon = await readXMLDVPL<{ root: ConsumablesCommon }>(
  //   `${DATA}/${POI.consumablesCommon}.dvpl`,
  // );
  // const consumablesCommonValues = Object.values(consumablesCommon.root);

  // await Promise.all(
  //   files
  //     .filter(
  //       (file) => file.endsWith('.txt.dvpl') && !file.endsWith('@2x.txt.dvpl'),
  //     )
  //     .map(async (file) => {
  //       const name = file.replace('.txt.dvpl', '');
  //       const sizes = await (
  //         await readStringDVPL(`${DATA}/${POI.consumableIcons}/${file}`)
  //       )
  //         .split('\n')[4]
  //         .split(' ')
  //         .map(Number);
  //       const commonEntry = consumablesCommonValues.find(
  //         (consumable) => consumable.icon === name,
  //       );

  //       if (!commonEntry) {
  //         console.warn(`No common entry found for ${name}; skipping...`);
  //         return;
  //       }

  //       const content = (
  //         await texture
  //           .clone()
  //           .extract({
  //             left: sizes[0],
  //             top: sizes[1],
  //             width: sizes[2],
  //             height: sizes[3],
  //           })
  //           .toBuffer()
  //       ).toString('base64');

  //       changes.push({
  //         path: `icons/consumables/${commonEntry.id}.webp`,
  //         encoding: 'base64',
  //         content,
  //       });
  //     }),
  // );

  const equipmentItemImageMappings = await readYAMLDVPL<Mappings>(
    `${DATA}/${POI.equipmentItemImageMappings}.dvpl`,
  );
  const consumablesCommon = await readXMLDVPL<{ root: ConsumablesCommon }>(
    `${DATA}/${POI.consumablesCommon}.dvpl`,
  );
  const styleSheets = Object.values(equipmentItemImageMappings.StyleSheets);

  Promise.all(
    Object.values(consumablesCommon.root).map(async (consumable) => {
      const styleSheet = styleSheets.find((styleSheet) =>
        styleSheet.selectors.includes(
          `.equipment_item.${consumable.icon} * .equipment-img`,
        ),
      );

      if (!styleSheet) {
        throw new Error(
          `No style sheet found for consumable ${consumable.icon}`,
        );
      }

      const configPath = styleSheet.properties['bg-sprite']
        .replace('~res:/', '')
        .replace('.psd', '.txt');

      if (configPath.startsWith('Gfx/Shared')) {
        const imagePath = `${configPath}.packed.webp.dvpl`;
        const content = (await readDVPLFile(`${DATA}/${imagePath}`)).toString(
          'base64',
        );

        changes.push({
          path: `icons/consumables/${consumable.id}.webp`,
          encoding: 'base64',
          content,
        });
      } else {
        const sizes = (await readStringDVPL(`${DATA}/${configPath}.dvpl`))
          .split('\n')[4]
          .split(' ')
          .map(Number);
        const content = (
          await texture
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
          path: `icons/consumables/${consumable.id}.webp`,
          encoding: 'base64',
          content,
        });
      }
    }),
  );

  console.log('Committing consumable icons...');
  await commitMultipleFiles(
    'tresabhi',
    'blitzkrieg-assets',
    'main',
    'consumable icons',
    changes,
    true,
  );
}

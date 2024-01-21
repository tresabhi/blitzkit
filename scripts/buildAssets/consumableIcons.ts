import sharp from 'sharp';
import { readDVPLFile } from '../../src/core/blitz/readDVPLFile';
import { readStringDVPL } from '../../src/core/blitz/readStringDVPL';
import { readXMLDVPL } from '../../src/core/blitz/readXMLDVPL';
import { readYAMLDVPL } from '../../src/core/blitz/readYAMLDVPL';
import { commitAssets } from '../../src/core/blitzkrieg/commitAssets';
import { FileChange } from '../../src/core/blitzkrieg/commitMultipleFiles';
import { DATA, POI } from './constants';
import { ConsumablesCommon } from './definitions';

interface Mappings {
  Header: { version: number };
  StyleSheets: {
    selectors: string[];
    properties: { 'bg-sprite': string };
  }[];
}

export async function buildConsumableIcons(production: boolean) {
  console.log('Building consumable icons...');

  const changes: FileChange[] = [];
  const texture = sharp(
    await readDVPLFile(
      `${DATA}/${POI.consumableIcons}/texture0.packed.webp.dvpl`,
    ),
  );

  const equipmentItemImageMappings = await readYAMLDVPL<Mappings>(
    `${DATA}/${POI.equipmentItemImageMappings}.dvpl`,
  );
  const consumablesCommon = await readXMLDVPL<{ root: ConsumablesCommon }>(
    `${DATA}/${POI.consumablesCommon}.dvpl`,
  );
  const styleSheets = Object.values(equipmentItemImageMappings.StyleSheets);

  await Promise.all(
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

  await commitAssets('consumable icons', changes, production);
}

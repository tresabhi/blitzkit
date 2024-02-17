import sharp from 'sharp';
import { readDVPLFile } from '../../src/core/blitz/readDVPLFile';
import { readStringDVPL } from '../../src/core/blitz/readStringDVPL';
import { readXMLDVPL } from '../../src/core/blitz/readXMLDVPL';
import { readYAMLDVPL } from '../../src/core/blitz/readYAMLDVPL';
import { commitAssets } from '../../src/core/blitzkrieg/commitAssets';
import { FileChange } from '../../src/core/blitzkrieg/commitMultipleFiles';
import { DATA, POI } from './constants';
import { ConsumablesCommon, ProvisionsCommon } from './definitions';

interface Mappings {
  Header: { version: number };
  StyleSheets: {
    selectors: string[];
    properties: { 'bg-sprite': string };
  }[];
}

export async function consumableProvisionIcons(production: boolean) {
  console.log('Building consumable and provision icons...');

  const changes: FileChange[] = [];
  const consumablesTexture = sharp(
    await readDVPLFile(
      `${DATA}/${POI.consumableIcons}/texture0.packed.webp.dvpl`,
    ),
  );
  const provisionsTexture = sharp(
    await readDVPLFile(
      `${DATA}/${POI.provisionIcons}/texture0.packed.webp.dvpl`,
    ),
  );

  const equipmentItemImageMappings = await readYAMLDVPL<Mappings>(
    `${DATA}/${POI.equipmentItemImageMappings}.dvpl`,
  );
  const consumablesCommon = await readXMLDVPL<{
    root: ConsumablesCommon;
  }>(`${DATA}/${POI.consumablesCommon}.dvpl`);
  const provisionsCommon = await readXMLDVPL<{
    root: ProvisionsCommon;
  }>(`${DATA}/${POI.provisionsCommon}.dvpl`);
  const styleSheets = Object.values(equipmentItemImageMappings.StyleSheets);

  await Promise.all(
    Object.values(consumablesCommon.root).map(async (consumable) => {
      const styleSheet = styleSheets.find((styleSheet) =>
        styleSheet.selectors.includes(
          `.equipment_item.${consumable.icon} * .equipment-img`,
        ),
      );

      if (!styleSheet) {
        console.warn(
          `No style sheet found for consumable ${consumable.icon}; skipping...`,
        );
        return;
      }

      const configPath = styleSheet.properties['bg-sprite']
        .replace('~res:/', '')
        .replace('.psd', '')
        .replace('.txt', '');

      if (configPath.startsWith('Gfx/Shared')) {
        const image = sharp(
          await readDVPLFile(`${DATA}/${configPath}.packed.webp.dvpl`),
        );
        const content = (
          await image.trim({ threshold: 100 }).toBuffer()
        ).toString('base64');

        changes.push({
          path: `icons/consumables/${consumable.id}.webp`,
          encoding: 'base64',
          content,
        });
      } else {
        const sizes = (await readStringDVPL(`${DATA}/${configPath}.txt.dvpl`))
          .split('\n')[4]
          .split(' ')
          .map(Number);
        const content = (
          await consumablesTexture
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

  await Promise.all(
    Object.values(provisionsCommon.root).map(async (provision) => {
      const styleSheet = styleSheets.find((styleSheet) =>
        styleSheet.selectors.includes(
          `.equipment_item.${provision.icon} * .equipment-img`,
        ),
      );

      if (!styleSheet) {
        console.warn(
          `No style sheet found for provision ${provision.icon}; skipping...`,
        );
        return;
      }

      const configPath = styleSheet.properties['bg-sprite']
        .replace('~res:/', '')
        .replace('.psd', '')
        .replace('.txt', '');

      if (configPath.startsWith('Gfx/Shared')) {
        const image = sharp(
          await readDVPLFile(`${DATA}/${configPath}.packed.webp.dvpl`),
        );
        const content = (
          await image.trim({ threshold: 100 }).toBuffer()
        ).toString('base64');

        changes.push({
          path: `icons/provisions/${provision.id}.webp`,
          encoding: 'base64',
          content,
        });
      } else {
        const sizes = (await readStringDVPL(`${DATA}/${configPath}.txt.dvpl`))
          .split('\n')[4]
          .split(' ')
          .map(Number);
        const content = (
          await provisionsTexture
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
          path: `icons/provisions/${provision.id}.webp`,
          encoding: 'base64',
          content,
        });
      }
    }),
  );

  await commitAssets('consumable and provision icons', changes, production);
}

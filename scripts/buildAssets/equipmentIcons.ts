import sharp from 'sharp';
import { readDVPLFile } from '../../src/core/blitz/readDVPLFile';
import { readStringDVPL } from '../../src/core/blitz/readStringDVPL';
import { readXMLDVPL } from '../../src/core/blitz/readXMLDVPL';
import { readYAMLDVPL } from '../../src/core/blitz/readYAMLDVPL';
import { commitAssets } from '../../src/core/blitzkrieg/commitAssets';
import { FileChange } from '../../src/core/blitzkrieg/commitMultipleFiles';
import { DATA, POI } from './constants';
import { OptionalDevices } from './definitions';

interface Mappings {
  Header: { version: number };

  StyleSheets: {
    selectors: string[];
    properties: { 'bg-sprite': string };
  }[];
}

export async function equipmentIcons(production: boolean) {
  console.log('Building equipment icons...');

  const changes: FileChange[] = [];
  const optionalDevices = await readXMLDVPL<{ root: OptionalDevices }>(
    `${DATA}/${POI.optionalDevices}.dvpl`,
  );
  const mappings = await readYAMLDVPL<Mappings>(
    `${DATA}/${POI.optionalDeviceImageMappings}.dvpl`,
  );
  const image = sharp(
    await readDVPLFile(`${DATA}/${POI.optionalDevicesImage}.dvpl`),
  );

  await Promise.all(
    Object.entries(optionalDevices.root).map(
      async ([optionalDeviceKey, optionalDevice]) => {
        if (optionalDeviceKey === 'nextAvailableId') return;

        const mapping = mappings.StyleSheets.find((mapping) =>
          mapping.selectors.includes(
            `.optional_device_item.${optionalDevice.icon} #Img`,
          ),
        );

        if (!mapping) {
          console.warn(
            `No mapping found for ${optionalDevice.icon}; skipping...`,
          );
          return;
        }

        const configPathRaw = mapping.properties['bg-sprite'];
        const configPath = configPathRaw.replace('~res:/', '');

        if (configPath.startsWith('Gfx/Lobby')) {
          const configPathWebp = configPath.replace('.txt', '');
          const buffer = await readDVPLFile(
            `${DATA}/${configPathWebp}.packed.webp.dvpl`,
          );

          changes.push({
            path: `icons/equipment/${optionalDevice.id}.webp`,
            encoding: 'base64',
            content: buffer.toString('base64'),
          });
        } else {
          const config = await readStringDVPL(`${DATA}/${configPath}.dvpl`);
          const sizes = config.split('\n')[4].split(' ').map(Number);
          const content = (
            await image
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
            path: `icons/equipment/${optionalDevice.id}.webp`,
            encoding: 'base64',
            content,
          });
        }
      },
    ),
  );

  commitAssets('equipment icons', changes, production);
}

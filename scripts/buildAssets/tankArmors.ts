import { NodeIO } from '@gltf-transform/core';
import { readdir } from 'fs/promises';
import { extractArmor } from '../../src/core/blitz/extractArmor';
import { readXMLDVPL } from '../../src/core/blitz/readXMLDVPL';
import { toUniqueId } from '../../src/core/blitz/toUniqueId';
import commitMultipleFiles, {
  FileChange,
} from '../../src/core/blitzkrieg/commitMultipleFiles';
import { DATA, POI } from './constants';
import { VehicleDefinitionList } from './definitions';

export async function buildTankArmors() {
  console.log('Building tank armors...');

  const changes: FileChange[] = [];
  const nodeIO = new NodeIO();
  const nations = await readdir(`${DATA}/${POI.vehicleDefinitions}`).then(
    (nations) => nations.filter((nation) => nation !== 'common'),
  );

  await Promise.all(
    nations.map(async (nation) => {
      if (nation !== 'germany') return;

      const tanks = await readXMLDVPL<{ root: VehicleDefinitionList }>(
        `${DATA}/${POI.vehicleDefinitions}/${nation}/list.xml.dvpl`,
      );

      await Promise.all(
        Object.entries(tanks.root).map(async ([tankKey, tank]) => {
          if (tankKey.includes('tutorial_bot')) return;

          const id = toUniqueId(nation, tank.id);

          console.log(`Building armor ${id} @ ${nation}/${tankKey}`);

          const model = await extractArmor(DATA, `${nation}-${tankKey}`);

          changes.push({
            path: `3d/tanks/armor/${id}.glb`,
            encoding: 'base64',
            content: Buffer.from(await nodeIO.writeBinary(model)).toString(
              'base64',
            ),
          });
        }),
      );
    }),
  );

  await commitMultipleFiles(
    'tresabhi',
    'blitzkrieg-assets',
    'main',
    'tank armor',
    changes,
    true,
  );
}

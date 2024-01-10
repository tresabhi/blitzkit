import { NodeIO } from '@gltf-transform/core';
import { readdir } from 'fs/promises';
import { extractArmor } from '../../src/core/blitz/extractArmor';
import { readXMLDVPL } from '../../src/core/blitz/readXMLDVPL';
import { toUniqueId } from '../../src/core/blitz/toUniqueId';
import commitMultipleFiles, {
  FileChange,
} from '../../src/core/blitzkrieg/commitMultipleFiles';
import { DATA, DOI } from './constants';
import { VehicleDefinitionList } from './definitions';

export async function buildTankArmors() {
  console.log('Building tank armors...');

  const changes: FileChange[] = [];
  const nodeIO = new NodeIO();
  const nations = await readdir(`${DATA}/${DOI.vehicleDefinitions}`).then(
    (nations) => nations.filter((nation) => nation !== 'common'),
  );

  await Promise.all(
    nations.map(async (nation) => {
      const tanks = await readXMLDVPL<{ root: VehicleDefinitionList }>(
        `${DATA}/${DOI.vehicleDefinitions}/${nation}/list.xml.dvpl`,
      );

      for (const tankKey in tanks.root) {
        const tank = tanks.root[tankKey];
        const id = toUniqueId(nation, tank.id);

        // if (id !== 7297) continue; // 60tp
        if (id !== 5137) continue; // tiger ii
        // if (id !== 24609) continue; // concept 1b

        console.log(`Building armor ${id} @ ${nation}/${tankKey}`);

        const model = await extractArmor(DATA, `${nation}-${tankKey}`);

        changes.push({
          path: `3d/tanks/armor/${id}.glb`,
          encoding: 'base64',
          content: Buffer.from(await nodeIO.writeBinary(model)).toString(
            'base64',
          ),
        });
      }
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

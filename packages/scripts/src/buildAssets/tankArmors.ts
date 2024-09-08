import { NodeIO } from '@gltf-transform/core';
import { readdir } from 'fs/promises';
import { extractArmor } from '../core/blitz/extractArmor';
import { readXMLDVPL } from '../core/blitz/readXMLDVPL';
import { commitAssets } from '../core/github/commitAssets';
import { FileChange } from '../core/github/commitMultipleFiles';
import { DATA } from './constants';
import { VehicleDefinitionList } from './definitions';
import { toUniqueId } from '@blitzkit/core';

export async function tankArmors() {
  console.log('Building tank armors...');

  const changes: FileChange[] = [];
  const nodeIO = new NodeIO();
  const nations = await readdir(`${DATA}/XML/item_defs/vehicles`).then(
    (nations) => nations.filter((nation) => nation !== 'common'),
  );

  await Promise.all(
    nations.map(async (nation) => {
      const tanks = await readXMLDVPL<{ root: VehicleDefinitionList }>(
        `${DATA}/XML/item_defs/vehicles/${nation}/list.xml.dvpl`,
      );

      await Promise.all(
        Object.entries(tanks.root).map(async ([tankKey, tank]) => {
          if (tankKey.includes('tutorial_bot')) return;

          const id = toUniqueId(nation, tank.id);
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

  await commitAssets('tank armor', changes);
}

import { NodeIO } from '@gltf-transform/core';
import { readdir } from 'fs/promises';
import { extractModel } from '../../src/core/blitz/extractModel';
import { readXMLDVPL } from '../../src/core/blitz/readXMLDVPL';
import { readYAMLDVPL } from '../../src/core/blitz/readYAMLDVPL';
import { toUniqueId } from '../../src/core/blitz/toUniqueId';
import { commitAssets } from '../../src/core/blitzkit/commitAssets';
import { FileChange } from '../../src/core/blitzkit/commitMultipleFiles';
import { DATA } from './constants';
import { VehicleDefinitionList } from './definitions';
import { TankParameters } from './tankIcons';

export async function tankModels() {
  console.log('Building tank models...');

  const nodeIO = new NodeIO();
  const nations = await readdir(`${DATA}/XML/item_defs/vehicles`).then(
    (nations) => nations.filter((nation) => nation !== 'common'),
  );

  for (const nationIndex in nations) {
    const nation = nations[nationIndex];
    const changes: FileChange[] = [];
    const tanks = await readXMLDVPL<{ root: VehicleDefinitionList }>(
      `${DATA}/XML/item_defs/vehicles/${nation}/list.xml.dvpl`,
    );

    console.log(`Building models for ${nation}`);

    await Promise.all(
      Object.entries(tanks.root).map(async ([tankKey, tank]) => {
        if (tankKey.includes('tutorial_bot')) return;

        const id = toUniqueId(nation, tank.id);
        const parameters = await readYAMLDVPL<TankParameters>(
          `${DATA}/3d/Tanks/Parameters/${nation}/${tankKey}.yaml.dvpl`,
        );
        const model = await extractModel(
          DATA,
          parameters.resourcesPath.blitzModelPath.replace(/\.sc2$/, ''),
        );

        changes.push({
          path: `3d/tanks/models/${id}.glb`,
          content: Buffer.from(await nodeIO.writeBinary(model)).toString(
            'base64',
          ),
          encoding: 'base64',
        });
      }),
    );

    await commitAssets(`tank models ${nation}`, changes);
  }
}

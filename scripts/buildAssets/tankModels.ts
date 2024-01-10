import { NodeIO } from '@gltf-transform/core';
import { readdir } from 'fs/promises';
import { Vector3Tuple } from 'three';
import { extractModel } from '../../src/core/blitz/extractModel';
import { readXMLDVPL } from '../../src/core/blitz/readXMLDVPL';
import { readYAMLDVPL } from '../../src/core/blitz/readYAMLDVPL';
import { toUniqueId } from '../../src/core/blitz/toUniqueId';
import commitMultipleFiles, {
  FileChange,
} from '../../src/core/blitzkrieg/commitMultipleFiles';
import { DATA, DOI } from './constants';
import { VehicleDefinitionList } from './definitions';
import { TankParameters } from './tankIcons';

interface VehicleCustomization {
  armorColor: string;
}

export async function buildTankModels() {
  console.log('Building tank models...');

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
      const customization = await readXMLDVPL<{ root: VehicleCustomization }>(
        `${DATA}/${DOI.vehicleDefinitions}/${nation}/customization.xml.dvpl`,
      );
      const baseColor = customization.root.armorColor
        .split(' ')
        .slice(0, 3)
        .map(Number)
        .map((channel) => channel / 255) as Vector3Tuple;

      for (const tankKey in tanks.root) {
        const tank = tanks.root[tankKey];
        const id = toUniqueId(nation, tank.id);

        // if (id !== 15697) continue; // chieftain
        // if (id !== 24609) continue; // concept 1b
        // if (id !== 16401) continue; // waffle
        // if (id !== 7425) continue; // isu 152
        // if (id !== 10369) continue; // mino
        // if (id !== 4417) continue; // amx m4 mle
        // if (id !== 7297) continue; // 60tp
        // if (id !== 1) continue; // t-34
        // if (id !== 6753) continue; // type 71
        if (id !== 5137) continue; // tiger ii
        // if (id !== 11633) continue; // forest witch
        // if (id !== 6225) continue; // fv215b
        // if (id !== 4481) continue; // kran
        // if (id !== 9489) continue; // e100
        // if (id !== 12049) continue; // jg e100
        // if (id !== 13569) continue; // obj 268

        console.log(`Building model ${id} @ ${nation}/${tankKey}`);

        const parameters = await readYAMLDVPL<TankParameters>(
          `${DATA}/${DOI.tankParameters}/${nation}/${tankKey}.yaml.dvpl`,
        );
        const model = await extractModel(
          DATA,
          parameters.resourcesPath.blitzModelPath.replace(/\.sc2$/, ''),
          baseColor,
        );

        changes.push({
          path: `3d/tanks/models/${id}.glb`,
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
    'tank models',
    changes,
    true,
  );
}

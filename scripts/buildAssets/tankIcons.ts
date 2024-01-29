import { readdir } from 'fs/promises';
import { Vector3Tuple } from 'three';
import { NATION_IDS } from '../../src/constants/nations';
import { readBase64DVPL } from '../../src/core/blitz/readBase64DVPL';
import { readXMLDVPL } from '../../src/core/blitz/readXMLDVPL';
import { readYAMLDVPL } from '../../src/core/blitz/readYAMLDVPL';
import { commitAssets } from '../../src/core/blitzkrieg/commitAssets';
import { FileChange } from '../../src/core/blitzkrieg/commitMultipleFiles';
import { DATA, POI } from './constants';
import { VehicleDefinitionList } from './definitions';

export interface TankParameters {
  resourcesPath: {
    smallIconPath: string;
    bigIconPath: string;
    blitzModelPath: string;
  };
  collision: {
    [key: string]: {
      points: Vector3Tuple;
      bbox: {
        min: Vector3Tuple;
        max: Vector3Tuple;
      };
      averageThickness?: Record<string, number>;
    };
  };
}

export async function buildTankIcons(production: boolean) {
  console.log('Building tank icons...');

  const changes: FileChange[] = [];
  const nations = await readdir(`${DATA}/${POI.vehicleDefinitions}`).then(
    (nations) => nations.filter((nation) => nation !== 'common'),
  );

  await Promise.all(
    nations.map(async (nation) => {
      const tanks = await readXMLDVPL<{ root: VehicleDefinitionList }>(
        `${DATA}/${POI.vehicleDefinitions}/${nation}/list.xml.dvpl`,
      );

      await Promise.all(
        Object.entries(tanks.root).map(async ([tankKey, tank]) => {
          if (tankKey.includes('tutorial_bot')) return;

          const nationVehicleId = tank.id;
          const id = (nationVehicleId << 8) + (NATION_IDS[nation] << 4) + 1;
          const parameters = await readYAMLDVPL<TankParameters>(
            `${DATA}/${POI.tankParameters}/${nation}/${tankKey}.yaml.dvpl`,
          );
          const small = `${DATA}/${parameters.resourcesPath.smallIconPath
            .replace(/~res:\//, '')
            .replace(/\..+/, '')}.packed.webp.dvpl`;
          const big = `${DATA}/${parameters.resourcesPath.bigIconPath
            .replace(/~res:\//, '')
            .replace(/\..+/, '')}.packed.webp.dvpl`;

          if (big) {
            changes.push({
              content: await readBase64DVPL(big),
              encoding: 'base64',
              path: `icons/tanks/big/${id}.webp`,
            });
          }
          if (small) {
            changes.push({
              content: await readBase64DVPL(small),
              encoding: 'base64',
              path: `icons/tanks/small/${id}.webp`,
            });
          }
        }),
      );
    }),
  );

  await commitAssets('tank icons', changes, production);
}

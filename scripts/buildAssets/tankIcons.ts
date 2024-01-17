import { readdir } from 'fs/promises';
import { NATION_IDS } from '../../src/constants/nations';
import { readBase64DVPL } from '../../src/core/blitz/readBase64DVPL';
import { readXMLDVPL } from '../../src/core/blitz/readXMLDVPL';
import { readYAMLDVPL } from '../../src/core/blitz/readYAMLDVPL';
import commitMultipleFiles, {
  FileChange,
} from '../../src/core/blitzkrieg/commitMultipleFiles';
import { DATA, POI } from './constants';
import { VehicleDefinitionList } from './definitions';

export interface TankParameters {
  resourcesPath: {
    smallIconPath: string;
    bigIconPath: string;
    blitzModelPath: string;
  };
}

export async function buildTankIcons() {
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
        Object.entries(tanks.root).map(async ([tankIndex, tank]) => {
          const nationVehicleId = tank.id;
          const id = (nationVehicleId << 8) + (NATION_IDS[nation] << 4) + 1;
          const parameters = await readYAMLDVPL<TankParameters>(
            `${DATA}/${POI.tankParameters}/${nation}/${tankIndex}.yaml.dvpl`,
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

  console.log('Committing tank icons...');
  await commitMultipleFiles(
    'tresabhi',
    'blitzkrieg-assets',
    'main',
    'tank icons',
    changes,
    true,
  );
}

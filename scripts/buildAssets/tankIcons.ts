import { readdir } from 'fs/promises';
import { NATION_IDS } from '../../src/constants/nations';
import { readBase64DVPL } from '../../src/core/blitz/readBase64DVPL';
import { readXMLDVPL } from '../../src/core/blitz/readXMLDVPL';
import { readYAMLDVPL } from '../../src/core/blitz/readYAMLDVPL';
import commitMultipleFiles, {
  FileChange,
} from '../../src/core/blitzkrieg/commitMultipleFiles';
import { DATA, DOI } from './constants';
import { VehicleDefinitionList } from './definitions';

export interface TankParameters {
  resourcesPath: {
    smallIconPath: string;
    bigIconPath: string;
    blitzModelPath: string;
  };
}

export async function buildTankIcons(big?: boolean, small?: boolean) {
  console.log('Building tank icons...');

  const changes: FileChange[] = [];
  const nations = await readdir(`${DATA}/${DOI.vehicleDefinitions}`).then(
    (nations) => nations.filter((nation) => nation !== 'common'),
  );

  await Promise.all(
    nations.map(async (nation) => {
      const tanks = await readXMLDVPL<{ root: VehicleDefinitionList }>(
        `${DATA}/${DOI.vehicleDefinitions}/${nation}/list.xml.dvpl`,
      );

      for (const tankIndex in tanks.root) {
        const tank = tanks.root[tankIndex];
        const nationVehicleId = tank.id;
        const id = (nationVehicleId << 8) + (NATION_IDS[nation] << 4) + 1;
        const parameters = await readYAMLDVPL<TankParameters>(
          `${DATA}/${DOI.tankParameters}/${nation}/${tankIndex}.yaml.dvpl`,
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
            path: `icons/tank/big/${id}.webp`,
          });
        }
        if (small) {
          changes.push({
            content: await readBase64DVPL(small),
            encoding: 'base64',
            path: `icons/tank/small/${id}.webp`,
          });
        }
      }
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

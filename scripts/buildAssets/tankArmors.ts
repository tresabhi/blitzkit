import { readdir } from 'fs/promises';
import { DATA, DOI } from '.';
import { NATION_IDS } from '../../src/constants/nations';
import { extractModel } from '../../src/core/blitz/extractModel';
import { readXMLDVPL } from '../../src/core/blitz/readXMLDVPL';
import { VehicleDefinitionList } from './definitions';

export async function buildTankArmors() {
  console.log('Building tank armors...');

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
        const nationVehicleId = tank.id;
        const id = (nationVehicleId << 8) + (NATION_IDS[nation] << 4) + 1;

        if (id !== 24609) continue; // concept 1b

        const model = extractModel(
          DATA,
          `${DOI.collisionMeshes}/${nation}-${tankKey}`,
        );

        console.log(`Building armor ${id} @ ${nation}/${tankKey}`);
      }
    }),
  );
}

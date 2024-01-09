import { NodeIO } from '@gltf-transform/core';
import { readdir, writeFile } from 'fs/promises';
import { extractArmor } from '../../src/core/blitz/extractArmor';
import { readXMLDVPL } from '../../src/core/blitz/readXMLDVPL';
import { toUniqueId } from '../../src/core/blitz/toUniqueId';
import { DATA, DOI } from './constants';
import { VehicleDefinitionList } from './definitions';

BigInt.prototype.toJSON = function () {
  return this.toString();
};

export async function buildTankArmors() {
  console.log('Building tank armors...');

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

        if (id !== 7297) continue; // 60tp
        // if (id !== 5137) continue; // tiger ii
        // if (id !== 24609) continue; // concept 1b

        console.log(`Building armor ${id} @ ${nation}/${tankKey}`);

        const model = await extractArmor(DATA, `${nation}-${tankKey}`);

        writeFile(`temp/armor/${id}.glb`, await nodeIO.writeBinary(model));

        // writeFile('test.sc2.json', JSON.stringify(sc2, null, 2));
      }
    }),
  );
}

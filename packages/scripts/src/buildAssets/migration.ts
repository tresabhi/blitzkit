import { toUniqueId } from '@blitzkit/core';
import { readdir } from 'fs/promises';
import { readXMLDVPL } from '../core/blitz/readXMLDVPL';
import { commitAssets } from '../core/github/commitAssets';
import { DATA } from './constants';
import { VehicleDefinitionList } from './definitions';

export async function migration() {
  console.log('Building migration map...');

  const map: Record<string, number> = {};
  const nations = await readdir(`${DATA}/XML/item_defs/vehicles`).then(
    (nations) => nations.filter((nation) => nation !== 'common'),
  );

  await Promise.all(
    nations.map(async (nation) => {
      const tankList = await readXMLDVPL<{ root: VehicleDefinitionList }>(
        `${DATA}/XML/item_defs/vehicles/${nation}/list.xml`,
      );

      for (const tankKey in tankList.root) {
        const tank = tankList.root[tankKey];
        const tankId = toUniqueId(nation, tank.id);
        const davaKey = `${nation}:${tankKey}`;

        map[davaKey] = tankId;
      }
    }),
  );

  await commitAssets('migration', [
    {
      path: 'definitions/migration.json',
      content: Buffer.from(JSON.stringify(map)),
    },
  ]);
}

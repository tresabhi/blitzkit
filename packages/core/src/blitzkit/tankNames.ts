import { deburr } from 'lodash-es';
import { fetchCamouflageDefinitions } from './camouflageDefinitions';
import { fetchTankDefinitions } from './tankDefinitions';

export async function fetchTankNames() {
  const [tankDefinitions, camouflageDefinitions] = await Promise.all([
    fetchTankDefinitions(),
    fetchCamouflageDefinitions(),
  ]);
  const tankDefinitionsArray = Object.values(tankDefinitions.tanks);

  return await Promise.all(
    tankDefinitionsArray.map(async (tank) => {
      return {
        id: tank.id,
        name: tank.name,
        nameFull: tank.name_full,
        searchableName: tank.name_full ?? tank.name,
        searchableNameDeburr: deburr(tank.name_full ?? tank.name),
        camouflages: tank.camouflages
          ?.map((id) => camouflageDefinitions.camouflages[id]?.name)
          .filter(Boolean)
          .join(' '),
        treeType: tank.type,
      };
    }),
  );
}

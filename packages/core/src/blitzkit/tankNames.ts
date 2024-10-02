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
    tankDefinitionsArray.map(async (tank, index) => {
      const { id } = tankDefinitionsArray[index];

      return {
        id,
        name: tank.name,
        nameFull: tank.nameFull,
        searchableName: tank.nameFull ?? tank.name,
        searchableNameDeburr: deburr(tank.nameFull ?? tank.name),
        camouflages: tank.camouflages
          ?.map((id) => camouflageDefinitions.camouflages[id].name)
          .join(' '),
        treeType: tank.type,
      };
    }),
  );
}

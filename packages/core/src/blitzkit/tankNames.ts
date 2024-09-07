import { deburr } from 'lodash';
import { camouflageDefinitions, tankDefinitionsArray } from '.';

export const tankNames = Promise.all([
  tankDefinitionsArray,
  camouflageDefinitions,
]).then(([tanks, camouflages]) =>
  Promise.all(
    tanks.map(async (tank, index) => {
      const { id } = (await tankDefinitionsArray)[index];

      return {
        id,
        name: tank.name,
        nameFull: tank.nameFull,
        searchableName: tank.nameFull ?? tank.name,
        searchableNameDeburr: deburr(tank.nameFull ?? tank.name),
        camouflages: tank.camouflages
          ?.map((id) => camouflages[id].name)
          .join(' '),
        treeType: tank.treeType,
      };
    }),
  ),
);

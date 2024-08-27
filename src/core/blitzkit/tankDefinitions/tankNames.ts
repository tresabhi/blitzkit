import { deburr } from 'lodash';
import { tanksDefinitionsArray } from '.';
import { camouflageDefinitions } from '../camouflageDefinitions';

export const tankNames = Promise.all([
  tanksDefinitionsArray,
  camouflageDefinitions,
]).then(([tanks, camouflages]) =>
  Promise.all(
    tanks.map(async (tank, index) => {
      const { id } = (await tanksDefinitionsArray)[index];

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

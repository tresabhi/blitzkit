import { deburr } from 'lodash-es';
import { SUPPORTED_LOCALES } from '../../../i18n/src/strings';
import { I18nString } from '../protos';
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
      const searchableNameDeburr: I18nString = { locales: {} };

      Object.entries(tank.name_full ?? tank.name).forEach(([key, value]) => {
        searchableNameDeburr.locales[key] = deburr(value);
      });

      return {
        id: tank.id,
        name: tank.name,
        nameFull: tank.name_full,
        searchableName: tank.name_full ?? tank.name,
        searchableNameDeburr,
        camouflages: tank.camouflages
          ?.map((id) => SUPPORTED_LOCALES.map((locale) => camouflageDefinitions.camouflages[id]?.name.locales[locale]))
          .flat()
          .filter(Boolean)
          .map(deburr)
          .join(' '),
        treeType: tank.type,
      };
    }),
  );
}

export const SEARCH_KEYS = [
  ...SUPPORTED_LOCALES.map((locale) => [
    `searchableName.locales.${locale}`,
    `searchableNameDeburr.locales.${locale}`,
  ]).flat(),
  'camouflages',
];

import { deburr } from 'lodash';
import { TankType, TreeTypeString } from '../../../components/Tanks';
import { asset } from '../asset';

export interface TankDefinition {
  id: number;
  nation: string;
  name: string;
  name_short?: string;
  tree_type: TreeTypeString;
  tier: Tier;
  type: TankType;
}

export type TankDefinitions = Record<number, TankDefinition>;

export const tankDefinitions = fetch(asset('definitions/tanks.json'), {
  cache: 'no-store',
}).then(async (response) => response.json() as Promise<TankDefinitions>);

const entries = new Promise<TankDefinition[]>(async (resolve) => {
  resolve(Object.entries(await tankDefinitions).map(([, entry]) => entry));
});
export const tanksDefinitionsArray = new Promise<TankDefinition[]>(
  async (resolve) => {
    resolve((await entries).map((entry) => entry));
  },
);
export const tankNames = new Promise<string[]>(async (resolve) => {
  resolve((await entries).map(({ name }) => name));
});
export const tankNamesDiacritics = tankNames.then((tankNames) =>
  Promise.all(
    tankNames.map(async (tankName, index) => {
      const { id } = (await tanksDefinitionsArray)[index];
      const name = tankName ?? `Unknown Tank ${id}`;
      const diacriticless = deburr(name);

      return {
        original: name,
        diacriticless,
        combined: `${name}${diacriticless}`,
        id,
      };
    }),
  ),
);

export const TANK_ICONS: Record<TankType, string> = {
  'AT-SPG': 'https://i.imgur.com/BIHSEH0.png',
  lightTank: 'https://i.imgur.com/CSNha5V.png',
  mediumTank: 'https://i.imgur.com/wvf3ltm.png',
  heavyTank: 'https://i.imgur.com/ECeqlZa.png',
};

export const TANK_ICONS_PREMIUM: Record<TankType, string> = {
  'AT-SPG': 'https://i.imgur.com/TCu3EdR.png',
  lightTank: 'https://i.imgur.com/zdkpTRb.png',
  mediumTank: 'https://i.imgur.com/3z7eHX6.png',
  heavyTank: 'https://i.imgur.com/P3vbmyA.png',
};

export const TANK_ICONS_COLLECTOR: Record<TankType, string> = {
  'AT-SPG': 'https://i.imgur.com/WTjeirB.png',
  lightTank: 'https://i.imgur.com/EwhtKkU.png',
  mediumTank: 'https://i.imgur.com/u8YDMBh.png',
  heavyTank: 'https://i.imgur.com/8xRf3nc.png',
};

export const TIERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export type Tier = (typeof TIERS)[number];

export const TIER_ROMAN_NUMERALS: Record<Tier, string> = {
  1: 'I',
  2: 'II',
  3: 'III',
  4: 'IV',
  5: 'V',
  6: 'VI',
  7: 'VII',
  8: 'VIII',
  9: 'IX',
  10: 'X',
};

export const NATIONS = tanksDefinitionsArray.then((tanks) => {
  const nationsObject: Record<string, true> = {};

  tanks.forEach(({ nation }) => {
    nationsObject[nation] = true;
  });

  return Object.keys(nationsObject);
});

import { deburr } from 'lodash';
import { TankType, TreeTypeString } from '../../components/Tanks';
import { asset } from './asset';

export interface TankopediaEntry {
  name: string;
  nation: string;
  is_premium: boolean;
  is_collectible: boolean;
  tier: Tier;
  cost: { price_credit: number; price_gold: number };
  images: { preview: string; normal: string };
  tank_id: number;
  type: string;
  description: string;
}
export interface Tankopedia {
  [id: number]: TankopediaEntry | undefined;
}

export interface BlitzkriegTankopediaEntry {
  id: number;
  nation: string;
  name: string;
  name_short?: string;
  tree_type: TreeTypeString;
  tier: Tier;
  type: TankType;
}

export type BlitzkriegTankopedia = Record<number, BlitzkriegTankopediaEntry>;

export const tankopedia = fetch(asset('tankopedia.json'), {
  cache: 'no-store',
}).then(async (response) => response.json() as Promise<BlitzkriegTankopedia>);
const entries = new Promise<BlitzkriegTankopediaEntry[]>(async (resolve) => {
  resolve(Object.entries(await tankopedia).map(([, entry]) => entry));
});
export const tanks = new Promise<BlitzkriegTankopediaEntry[]>(
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
      const { id } = (await tanks)[index];
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

export type Tier = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export const TIERS: Tier[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

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

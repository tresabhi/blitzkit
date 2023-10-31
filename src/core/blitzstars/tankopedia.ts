import { deburr } from 'lodash';
import { context } from '../blitzkrieg/context';
import { withCORSProxy } from '../blitzkrieg/withCORSProxy';

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

export const tankopedia = fetch(
  withCORSProxy('https://www.blitzstars.com/bs-tankopedia.json'),
)
  .then(async (response) => response.json())
  .then((wrapperTankopedia) =>
    context === 'bot'
      ? (wrapperTankopedia as { data: Tankopedia }).data
      : (wrapperTankopedia as Tankopedia),
  );
const entries = new Promise<TankopediaEntry[]>(async (resolve) => {
  resolve(Object.entries(await tankopedia).map(([, entry]) => entry));
});
export const TANKS = new Promise<TankopediaEntry[]>(async (resolve) => {
  resolve((await entries).map((entry) => entry));
});
export const TANK_NAMES = new Promise<string[]>(async (resolve) => {
  resolve((await entries).map(({ name }) => name));
});
export const TANK_NAMES_DIACRITICS = TANK_NAMES.then((tankNames) =>
  Promise.all(
    tankNames.map(async (tankName, index) => {
      const id = (await TANKS)[index].tank_id;
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

export const TANK_ICONS: Record<string, string> = {
  'AT-SPG': 'https://i.imgur.com/BIHSEH0.png',
  lightTank: 'https://i.imgur.com/CSNha5V.png',
  mediumTank: 'https://i.imgur.com/wvf3ltm.png',
  heavyTank: 'https://i.imgur.com/ECeqlZa.png',
};

export const TANK_ICONS_PREMIUM: Record<string, string> = {
  'AT-SPG': 'https://i.imgur.com/TCu3EdR.png',
  lightTank: 'https://i.imgur.com/zdkpTRb.png',
  mediumTank: 'https://i.imgur.com/3z7eHX6.png',
  heavyTank: 'https://i.imgur.com/P3vbmyA.png',
};

export const TANK_ICONS_COLLECTOR: Record<string, string> = {
  'AT-SPG': 'https://i.imgur.com/WTjeirB.png',
  lightTank: 'https://i.imgur.com/EwhtKkU.png',
  mediumTank: 'https://i.imgur.com/u8YDMBh.png',
  heavyTank: 'https://i.imgur.com/8xRf3nc.png',
};

export type Tier = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

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

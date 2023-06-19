import { WargamingResponse } from '../../types/wargamingResponse.js';

export type TankType = 'AT-SPG' | 'lightTank' | 'mediumTank' | 'heavyTank';

export interface TankopediaEntry {
  name: string;
  nation: string;
  is_premium: boolean;
  tier: number;
  cost: { price_credit: number; price_gold: number };
  images: { preview: string; normal: string };
  tank_id: number;
  type: TankType;
  description: string;
}

export interface Tankopedia {
  [id: number]: TankopediaEntry;
}

export const tankopedia: Tankopedia = {};
export const TANK_IDS: number[] = [];
export const TANKS: TankopediaEntry[] = [];
export const TANK_NAMES: string[] = [];

console.log('Caching tankopedia...');
fetch('https://www.blitzstars.com/bs-tankopedia.json')
  .then(
    (response) =>
      response.json() as Promise<
        WargamingResponse<Tankopedia> & { status: 'ok' }
      >,
  )
  .then((wargamingResponse) => {
    Object.assign(tankopedia, wargamingResponse.data);
    Object.entries(tankopedia).forEach(([idString, entry]) => {
      const id = Number(idString);

      TANK_IDS.push(id);
      TANKS.push(entry);
      TANK_NAMES.push(entry.name);
    }),
      console.log('Cached tankopedia');
  });

export const TANK_ICONS: Record<TankType, string> = {
  'AT-SPG': 'https://i.imgur.com/BIHSEH0.png',
  lightTank: 'https://i.imgur.com/CSNha5V.png',
  mediumTank: 'https://i.imgur.com/wvf3ltm.png',
  heavyTank: 'https://i.imgur.com/ECeqlZa.png',
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

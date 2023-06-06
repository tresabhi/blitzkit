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

console.log('Caching tankopedia...');
export const tankopedia = (
  (await (
    await fetch('https://www.blitzstars.com/bs-tankopedia.json')
  ).json()) as WargamingResponse<Tankopedia> & { status: 'ok' }
).data;
console.log('Cached tankopedia');

export const TANK_ICONS: Record<TankType, string> = {
  'AT-SPG': 'https://i.imgur.com/BIHSEH0.png',
  lightTank: 'https://i.imgur.com/CSNha5V.png',
  mediumTank: 'https://i.imgur.com/wvf3ltm.png',
  heavyTank: 'https://i.imgur.com/ECeqlZa.png',
};

export const TIER_ROMAN_NUMERALS: Record<number, string> = {
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

export const TANK_IDS = Object.keys(tankopedia).map((id) => Number(id));
export const TANKS = TANK_IDS.map((id) => tankopedia[id]);
export const TANK_NAMES = TANKS.map((tank) => tank.name);

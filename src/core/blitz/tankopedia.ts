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
export const tankopedia = fetch('https://www.blitzstars.com/bs-tankopedia.json')
  .then((response) => response.json())
  .then((wrapperTankopedia) => {
    console.log('Tankopedia cached');
    return (wrapperTankopedia as { data: Tankopedia }).data;
  });
const entries = Object.entries(tankopedia);
export const TANK_IDS = entries.map(([, { tank_id }]) => tank_id as number);
export const TANKS = entries.map(([, entry]) => entry as TankopediaEntry);
export const TANK_NAMES = entries.map(([, { name }]) => name);

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

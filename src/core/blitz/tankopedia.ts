import { WARGAMING_APPLICATION_ID } from '../node/arguments.js';
import getWargamingResponse from './getWargamingResponse.js';

export interface TankopediaEntry {
  tank_id: number;
  name: string;
  tier: number;
  type: string;
  is_premium: boolean;
  images: { preview: string; normal: string };
}

export interface Tankopedia {
  [id: number]: TankopediaEntry | undefined;
}

console.log('Caching tankopedia...');
export const tankopedia = getWargamingResponse<Tankopedia>(
  `https://api.wotblitz.com/wotb/encyclopedia/vehicles/?application_id=${WARGAMING_APPLICATION_ID}&fields=name,tier,images,tank_id,type,is_premium`,
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

export const TANK_ICONS: Record<string, string> = {
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

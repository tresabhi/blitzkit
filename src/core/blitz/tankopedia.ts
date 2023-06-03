import { WargamingResponse } from '../../types/wargamingResponse.js';
import URLToBase64 from '../ui/URLToBase64.js';

export interface TankopediaEntry {
  name: string;
  nation: string;
  is_premium: boolean;
  tier: number;
  cost: { price_credit: number; price_gold: number };
  images: { preview: string; normal: string };
  tank_id: number;
  type: string;
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

/**
 * @deprecated
 */
export const TANK_TYPE_EMOJIS: Record<string, string> = {
  'AT-SPG': '🔽',
  heavyTank: '🇭',
  mediumTank: '🇲',
  lightTank: '🇱',
};

export const TANK_IDS = Object.keys(tankopedia).map((id) => Number(id));
export const TANKS = TANK_IDS.map((id) => tankopedia[id]);
export const TANK_NAMES = TANKS.map((tank) => tank.name);

console.log('Encoding tank images...');
await Promise.all(
  Object.entries(tankopedia).map(async ([, tank]) => {
    if (tank.images.normal) {
      tank.images.normal = await URLToBase64(tank.images.normal);
    }
  }),
);
console.log('Encoded tank images');

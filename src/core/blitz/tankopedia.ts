import { WargamingResponse } from '../../types/wargamingResponse.js';
import URLToBase64 from '../ui/URLToBase64.js';

/*
"1": {
      "name": "T-34",
      "nation": "ussr",
      "is_premium": false,
      "tier": 5,
      "cost": {
        "price_credit": 400000,
        "price_gold": 0
      },
      "images": {
        "preview": "/api/bs-cache/tank-icons/https%3A%2F%2Fglossary-eu-static.gcdn.co%2Ficons%2Fwotb%2Fcurrent%2Fuploaded%2Fvehicles%2Fhd_thumbnail%2FT-34.png",
        "normal": "http://glossary-eu-static.gcdn.co/icons/wotb/current/uploaded/vehicles/hd/T-34.png"
      },
      "tank_id": 1,
      "type": "mediumTank",
      "description": "The legend of the Soviet armored forces and the most widely-produced Soviet tank of World War II, with a total of 33,805 vehicles manufactured. Three variants of this model were produced at several Soviet factories from 1940 through 1944."
    },
    */

export interface Tankopedia {
  [id: number]: {
    name: string;
    nation: string;
    is_premium: boolean;
    tier: number;
    cost: { price_credit: number; price_gold: number };
    images: { preview: string; normal: string };
    tank_id: number;
    type: string;
    description: string;
  };
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
    try {
      tank.images.normal = await URLToBase64(tank.images.normal);
    } catch (error) {
      console.warn(
        `Failed to encode tank image for ${tank.images.normal}: ${error}`,
      );
    }
  }),
);
console.log('Encoded tank images');

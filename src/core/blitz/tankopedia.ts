import { StaticPool } from 'node-worker-threads-pool';
import { WargamingResponse } from '../../types/wargamingResponse.js';

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

const imageEncodingStaticPool = new StaticPool({
  size: 1,
  task: async (data: Tankopedia) => {
    console.log('Encoding tank images...');

    const encoded: [number, string][] = [];

    await Promise.all(
      Object.entries(data as Tankopedia).map(
        async ([, tank]: [string, TankopediaEntry]) => {
          if (tank.images.normal) {
            const response = await fetch(tank.images.normal);
            const blob = await response.arrayBuffer();
            const base64 = `data:${response.headers.get(
              'content-type',
            )};base64,${Buffer.from(blob).toString('base64')}`;
            encoded.push([tank.tank_id, base64]);
          }
        },
      ),
    );

    console.log('Encoded tank images');

    return encoded;
  },
});

imageEncodingStaticPool.exec(tankopedia).then((encoded) => {
  console.log('Implementing encoded images...');
  encoded.forEach(([tankId, image]) => {
    tankopedia[tankId].images.normal = image;
  });
  console.log('Implemented encoded images');
});

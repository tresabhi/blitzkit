export type TankType = 'heavyTank' | 'AT-SPG' | 'mediumTank' | 'lightTank';

export interface Tankopedia {
  status: 'ok'; // always will be ok since it is cached
  meta: {
    count: number;
  };
  data: {
    [tankId: number]: {
      name?: string;
      nation: string;
      is_premium: boolean;
      tier: number;
      cost: {
        price_credit: number;
        price_gold: number;
      };
      images: {
        preview: string;
        normal?: string;
      };
      tank_id: number;
      type: TankType;
      description: string;
    };
  };
}

console.log('Caching tankopedia...');
export const tankopedia = (
  (await (
    await fetch('https://www.blitzstars.com/bs-tankopedia.json')
  ).json()) as Tankopedia
).data;
console.log('Cached tankopedia');

export const tankIds = Object.keys(tankopedia) as unknown as number[];

export const tankNames = tankIds.map((id) => tankopedia[id].name);

export const tanks = tankIds.map((id) => tankopedia[id]);

export const TANK_TYPE_NAMES: Record<TankType, string> = {
  'AT-SPG': 'Tank Destroyer',
  heavyTank: 'Heavy Tank',
  mediumTank: 'Medium Tank',
  lightTank: 'Light Tank',
};

export const TANK_TYPE_EMOJIS: Record<TankType, string> = {
  'AT-SPG': '🔽',
  heavyTank: '🇭',
  mediumTank: '🇲',
  lightTank: '🇱',
};

console.log('Encoding tank images...');
await Promise.all(
  Object.entries(tankopedia).map(async ([, tank]) => {
    if (tank.images.normal) {
      const response = await fetch(tank.images.normal);
      const blob = await response.arrayBuffer();
      const base64 = `data:${response.headers.get(
        'content-type',
      )};base64,${Buffer.from(blob).toString('base64')}`;

      tank.images.normal = base64;
    }
  }),
);
console.log('Encoded tank images');

import fetch from 'node-fetch';

export type TankType = 'heavyTank' | 'AT-SPG' | 'mediumTank' | 'lightTank';

export interface Tankopedia {
  status: 'ok'; // always will be ok since it is cached
  meta: {
    count: number;
  };
  data: {
    [tankId: number]: {
      name: string;
      nation: string;
      is_premium: boolean;
      tier: number;
      cost: {
        price_credit: number;
        price_gold: number;
      };
      images: {
        preview: string;
        normal: string;
      };
      tank_id: number;
      type: TankType;
      description: string;
    };
  };
}

export const tankopedia = (await (
  await fetch('https://www.blitzstars.com/bs-tankopedia.json')
).json()) as Tankopedia;

export const tankTypeNames: Record<TankType, string> = {
  'AT-SPG': 'Tank Destroyer',
  heavyTank: 'Heavy Tank',
  mediumTank: 'Medium Tank',
  lightTank: 'Light Tank',
};
export const tankTypeEmojis: Record<TankType, string> = {
  'AT-SPG': '🔽',
  heavyTank: '🇭',
  mediumTank: '🇲',
  lightTank: '🇱',
};

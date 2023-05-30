import { args } from '../process/args.js';
import isDev from '../process/isDev.js';
import URLToBase64 from '../ui/URLToBase64.js';
import getWargamingResponse from './getWargamingResponse.js';

export interface Tankopedia {
  [id: number]: {
    description: string;
    engines: number[];
    guns: number[];
    is_premium: boolean;
    name: string;
    nation: string;
    next_tanks: { [id: number]: number };
    prices_xp: { [id: number]: number };
    suspensions: number[];
    tank_id: number;
    tier: number;
    turrets: number[] | null;
    type: string;
    cost: {
      price_credit: number;
      price_gold: number;
    };
    default_profile: {
      battle_level_range_max: number;
      battle_level_range_min: number;
      engine_id: number;
      firepower: number;
      gun_id: number;
      hp: number;
      hull_hp: number;
      hull_weight: number;
      is_default: boolean;
      maneuverability: number;
      max_ammo: number;
      max_weight: number;
      profile_id: string;
      protection: number;
      shot_efficiency: number;
      signal_range: number;
      speed_backward: number;
      suspension_id: number;
      turret_id: number;
      weight: number;
      armor: {
        hull: {
          front: number;
          rear: number;
          sides: number;
        };
        turret: {
          front: number;
          rear: number;
          sides: number;
        };
      };
      engine: {
        fire_chance: number;
        name: string;
        power: number;
        tier: number;
        weight: number;
      };
      gun: {
        aim_time: number;
        caliber: number;
        clip_capacity: number;
        clip_reload_time: number;
        dispersion: number;
        fire_rate: number;
        move_down_arc: number;
        move_up_arc: number;
        name: string;
        reload_time: number;
        tier: number;
        traverse_speed: number;
        weight: number;
      };
      shells: {
        damage: number;
        penetration: number;
        type: string;
      };
      suspension: {
        load_limit: number;
        name: string;
        tier: number;
        traverse_speed: number;
        weight: number;
      };
      turret: {
        hp: number;
        name: string;
        tier: number;
        traverse_left_arc: number;
        traverse_right_arc: number;
        traverse_speed: number;
        view_range: number;
        weight: number;
      };
    };
    images: {
      normal: string;
      preview: string;
    };
    modules_tree: {
      [id: number]: {
        is_default: boolean;
        module_id: number;
        name: string;
        next_modules: number[] | null;
        next_tanks: number[] | null;
        price_credit: number;
        price_xp: number;
        type: string;
      };
    };
  };
}

export interface TankopediaInfo {
  achievement_sections: { [name: string]: { name: string; order: number } };
  tanks_updated_at: number;
  languages: { [name: string]: string };
  vehicle_types: { [name: string]: string };
  vehicle_nations: { [name: string]: string };
  game_version: string;
}

console.log('Caching tankopedia...');
export const tankopedia = await getWargamingResponse<Tankopedia>(
  `https://api.wotblitz.com/wotb/encyclopedia/vehicles/?application_id=${args['wargaming-application-id']}`,
);
console.log('Cached tankopedia');

console.log('Caching tankopedia info...');
export const tankopediaInfo = await getWargamingResponse<TankopediaInfo>(
  `https://api.wotblitz.com/wotb/encyclopedia/info/?application_id=${args['wargaming-application-id']}`,
);
console.log('Cached tankopedia info');

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

if (!isDev()) {
  console.log('Encoding tank images...');
  await Promise.all(
    Object.entries(tankopedia).map(async ([, tank]) => {
      tank.images.normal = await URLToBase64(tank.images.normal);
    }),
  );
  console.log('Encoded tank images');
}

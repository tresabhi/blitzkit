import { deburr } from 'lodash';
import { Vector2Tuple } from 'three';
import { TankType, TreeTypeString } from '../../components/Tanks';
import { asset } from './asset';

export type ShellType = 'ap' | 'ap_cr' | 'hc' | 'he';

export const SHELL_NAMES: Record<ShellType, string> = {
  ap: 'AP',
  ap_cr: 'APCR',
  hc: 'HEAT',
  he: 'HE',
};

export type TankDefinitions = Record<number, TankDefinition>;
export interface TankDefinition {
  id: number;
  nation: string;
  name: string;
  tree_type: TreeTypeString;
  tier: Tier;
  type: TankType;
  testing?: boolean;
  turrets: TurretDefinition[];
  price: TankDefinitionPrice;
  camouflage: { still: number; moving: number; firing: number };
}
export type TankDefinitionPrice =
  | { type: 'credits'; value: number }
  | { type: 'gold'; value: number };
export interface TurretDefinition {
  id: number;
  name: string;
  tier: Tier;
  guns: GunDefinition[];
}
export type GunDefinition = GunDefinitionBase &
  (GunDefinitionRegular | GunDefinitionAutoLoader | GunDefinitionAutoReloader);
interface GunDefinitionBase {
  id: number;
  name: string;
  tier: Tier;
  shells: ShellDefinition[];
}
interface GunDefinitionRegular {
  type: 'regular';
  reload: number;
}
interface GunDefinitionAutoLoader {
  type: 'auto_loader';
  reload: number;
  interClip: number;
  count: number;
}
interface GunDefinitionAutoReloader {
  type: 'auto_reloader';
  reload: number[];
  interClip: number;
  count: number;
}
export type ShellDefinition = {
  id: number;
  name: string;
  speed: number;
  damage: { armor: number; devices: number };
  caliber: number;
  icon: string;
  penetration: number | Vector2Tuple;
} & (
  | {
      type: Omit<ShellType, 'hc' | 'he'>;
      normalization: number;
      ricochet: number;
    }
  | {
      type: Omit<ShellType, 'ap' | 'ap_cr'>;
    }
);

export const tankDefinitions = fetch(asset('definitions/tanks.json'), {
  cache: 'no-cache',
}).then(async (response) => response.json() as Promise<TankDefinitions>);

const entries = new Promise<TankDefinition[]>(async (resolve) => {
  resolve(Object.entries(await tankDefinitions).map(([, entry]) => entry));
});
export const tanksDefinitionsArray = new Promise<TankDefinition[]>(
  async (resolve) => {
    resolve((await entries).map((entry) => entry));
  },
);
export const tankNames = new Promise<string[]>(async (resolve) => {
  resolve((await entries).map(({ name }) => name));
});
export const tankNamesDiacritics = tankNames.then((tankNames) =>
  Promise.all(
    tankNames.map(async (tankName, index) => {
      const { id } = (await tanksDefinitionsArray)[index];
      const name = tankName ?? `Unknown Tank ${id}`;
      const diacriticless = deburr(name);

      return {
        original: name,
        diacriticless,
        combined: `${name}${diacriticless}`,
        id,
      };
    }),
  ),
);

export const TANK_ICONS: Record<TankType, string> = {
  tank_destroyer: 'https://i.imgur.com/BIHSEH0.png',
  light: 'https://i.imgur.com/CSNha5V.png',
  medium: 'https://i.imgur.com/wvf3ltm.png',
  heavy: 'https://i.imgur.com/ECeqlZa.png',
};

export const TANK_ICONS_PREMIUM: Record<TankType, string> = {
  tank_destroyer: 'https://i.imgur.com/TCu3EdR.png',
  light: 'https://i.imgur.com/zdkpTRb.png',
  medium: 'https://i.imgur.com/3z7eHX6.png',
  heavy: 'https://i.imgur.com/P3vbmyA.png',
};

export const TANK_ICONS_COLLECTOR: Record<TankType, string> = {
  tank_destroyer: 'https://i.imgur.com/WTjeirB.png',
  light: 'https://i.imgur.com/EwhtKkU.png',
  medium: 'https://i.imgur.com/u8YDMBh.png',
  heavy: 'https://i.imgur.com/8xRf3nc.png',
};

export const TIERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export type Tier = (typeof TIERS)[number];

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

export const NATIONS = tanksDefinitionsArray.then((tanks) => {
  const nationsObject: Record<string, true> = {};

  tanks.forEach(({ nation }) => {
    nationsObject[nation] = true;
  });

  return Object.keys(nationsObject);
});

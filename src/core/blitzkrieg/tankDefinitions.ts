import { deburr } from 'lodash';
import { Vector2Tuple } from 'three';
import { TankType, TreeType } from '../../components/Tanks';
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
  health: number;
  nation: string;
  name: string;
  nameFull?: string;
  treeType: TreeType;
  consumables: number;
  provisions: number;
  tier: Tier;
  type: TankType;
  testing?: boolean;
  turrets: TurretDefinition[];
  engines: EngineDefinition[];
  price: TankDefinitionPrice;
  speed: {
    forwards: number;
    backwards: number;
  };
  camouflage: {
    still: number;
    moving: number;
    onFire: number;
  };
  traverseSpeed: number;
  dispersion: {
    move: number;
    traverse: number;
  };
  equipment: string;
}
export interface EngineDefinition {
  id: number;
  name: string;
  tier: Tier;
  fire_chance: number;
}
export type TankDefinitionPrice =
  | { type: 'credits'; value: number }
  | { type: 'gold'; value: number };
export interface TurretDefinition {
  health: number;
  viewRange: number;
  traverseSpeed: number;
  id: number;
  name: string;
  tier: Tier;
  guns: GunDefinition[];
}
export type GunDefinition =
  | GunDefinitionRegular
  | GunDefinitionAutoLoader
  | GunDefinitionAutoReloader;
interface GunDefinitionBase {
  rotationSpeed: number;
  id: number;
  name: string;
  tier: Tier;
  shells: ShellDefinition[];
  camouflageLoss: number;
  aimTime: number;
  dispersion: {
    base: number;
    traverse: number;
    shot: number;
    damaged: number;
  };
}
interface GunDefinitionRegular extends GunDefinitionBase {
  type: 'regular';
  reload: number;
}
interface GunDefinitionAutoLoader extends GunDefinitionBase {
  type: 'autoLoader';
  reload: number;
  interClip: number;
  count: number;
}
interface GunDefinitionAutoReloader extends GunDefinitionBase {
  type: 'autoReloader';
  reload: number[];
  interClip: number;
  count: number;
}
export type ShellDefinition = {
  id: number;
  name: string;
  speed: number;
  damage: { armor: number; module: number };
  caliber: number;
  icon: string;
  penetration: number | Vector2Tuple;
  type: ShellType;
  normalization?: number;
  ricochet?: number;
  explosionRadius?: number;
};

export const GUN_TYPE_NAMES: Record<GunDefinition['type'], string> = {
  regular: 'Regular',
  autoLoader: 'Auto loader',
  autoReloader: 'Auto reloader',
};

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
export const tankNames = tanksDefinitionsArray.then((tanks) =>
  Promise.all(
    tanks.map(async (tank, index) => {
      const { id } = (await tanksDefinitionsArray)[index];

      return {
        id,
        original: tank.name,
        combined: `${tank.name}${deburr(tank.name)}${tank.nameFull ? `${tank.nameFull}${deburr(tank.nameFull)}` : ''}`,
      };
    }),
  ),
);

export const TANK_ICONS: Record<TankType, string> = {
  tankDestroyer: 'https://i.imgur.com/BIHSEH0.png',
  light: 'https://i.imgur.com/CSNha5V.png',
  medium: 'https://i.imgur.com/wvf3ltm.png',
  heavy: 'https://i.imgur.com/ECeqlZa.png',
};

export const TANK_ICONS_PREMIUM: Record<TankType, string> = {
  tankDestroyer: 'https://i.imgur.com/TCu3EdR.png',
  light: 'https://i.imgur.com/zdkpTRb.png',
  medium: 'https://i.imgur.com/3z7eHX6.png',
  heavy: 'https://i.imgur.com/P3vbmyA.png',
};

export const TANK_ICONS_COLLECTOR: Record<TankType, string> = {
  tankDestroyer: 'https://i.imgur.com/WTjeirB.png',
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

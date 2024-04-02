import { deburr } from 'lodash';
import { Vector2Tuple } from 'three';
import { TankClass, TreeType } from '../../../components/Tanks';
import { asset } from '../asset';
import { fetchCdonLz4 } from '../fetchCdonLz4';
import { TIERS } from './constants';

export type ShellType = 'ap' | 'ap_cr' | 'hc' | 'he';

export type CrewMember =
  | 'commander'
  | 'radioman'
  | 'gunner'
  | 'driver'
  | 'loader';
export type TankDefinitions = Record<number, TankDefinition>;
export interface Crew {
  type: CrewMember;
  count?: number;
  substitute?: CrewMember[];
}
export interface TankDefinition {
  id: number;
  fixedCamouflage?: boolean;
  ancestors?: number[];
  successors?: number[];
  crew: Crew[];
  health: number;
  nation: string;
  name: string;
  nameFull?: string;
  treeType: TreeType;
  consumables: number;
  provisions: number;
  tier: Tier;
  class: TankClass;
  testing?: boolean;
  turrets: TurretDefinition[];
  engines: EngineDefinition[];
  tracks: TrackDefinition[];
  price: TankDefinitionPrice;
  xp?: number;
  speed: {
    forwards: number;
    backwards: number;
  };
  camouflage: {
    still: number;
    moving: number;
    onFire: number;
  };
  equipment: string;
  weight: number;
}
export interface TrackDefinition {
  id: number;
  tier: Tier;
  name: string;
  weight: number;
  traverseSpeed: number;
  xp?: number;
  dispersion: {
    move: number;
    traverse: number;
  };
  resistance: {
    hard: number;
    medium: number;
    soft: number;
  };
}
export interface EngineDefinition {
  id: number;
  name: string;
  xp?: number;
  tier: Tier;
  fireChance: number;
  power: number;
  weight: number;
}
export type TankDefinitionPrice =
  | { type: 'credits'; value: number }
  | { type: 'gold'; value: number };
export interface TurretDefinition {
  health: number;
  viewRange: number;
  traverseSpeed: number;
  xp?: number;
  id: number;
  name: string;
  tier: Tier;
  guns: GunDefinition[];
  weight: number;
}
export type GunDefinition =
  | GunDefinitionRegular
  | GunDefinitionAutoLoader
  | GunDefinitionAutoReloader;
interface GunDefinitionBase {
  rotationSpeed: number;
  xp?: number;
  weight: number;
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
  intraClip: number;
  count: number;
}
interface GunDefinitionAutoReloader extends GunDefinitionBase {
  type: 'autoReloader';
  reload: number[];
  intraClip: number;
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

export const tankDefinitions = fetchCdonLz4<TankDefinitions>(
  asset('definitions/tanks.cdon.lz4'),
);

// export const tankDefinitions = readFile('test.tanks.cdon.lz4').then((data) =>
//   superDecompress<TankDefinitions>(data.buffer),
// );

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
        treeType: tank.treeType,
      };
    }),
  ),
);

export type Tier = (typeof TIERS)[number];

export const NATIONS = tanksDefinitionsArray.then((tanks) => {
  const nations = Array.from(
    new Set<string>(Object.values(tanks).map((tank) => tank.nation)),
  );

  nations.splice(nations.indexOf('other'), 1);
  nations.push('other');

  return nations;
});

export const flags: Record<string, string> = {
  ussr: '<:ussr:1218421042033197197>',
  germany: '🇩🇪',
  usa: '🇺🇸',
  china: '🇨🇳',
  uk: '🇬🇧',
  france: '🇫🇷',
  japan: '🇯🇵',
  european: '🇪🇺',
  other: '<:other:1218421572243558482>',
};

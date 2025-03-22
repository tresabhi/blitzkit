import {
  createDefaultSkills,
  ShellDefinition,
  TankArmor,
} from '@blitzkit/core';
import type { Vector3 } from 'three';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { ArmorType } from '../components/Armor/components/SpacedArmorScene';
import type { ExternalModuleVariant } from '../components/Armor/components/SpacedArmorSceneComponent';
import type { XP_MULTIPLIERS } from '../components/Tankopedia/TechTreeSection';
import { awaitableSkillDefinitions } from '../core/awaitables/skillDefinitions';
import { createContextualStore } from '../core/zustand/createContextualStore';
import { TankopediaDisplay } from './tankopediaPersistent/constants';

export interface ShotLayerBase {
  index: number;
  thickness: number;
  point: Vector3;
  surfaceNormal: Vector3;
  status: 'blocked' | 'penetration' | 'ricochet';
}

interface ShotLayerExternal extends ShotLayerBase {
  type: ArmorType.External;
  variant: ExternalModuleVariant;
}

export interface ShotLayerNonExternal extends ShotLayerBase {
  type: Exclude<ArmorType, ArmorType.External>;
  angle: number;
  thicknessAngled: number;
}

export interface ShotLayerGap {
  type: null;
  status: 'penetration' | 'blocked';
  distance: number;
}

export type ShotLayer = ShotLayerExternal | ShotLayerNonExternal | ShotLayerGap;

export type Shot = {
  containsGaps: boolean;
  damage: number;
  splashRadius?: number;

  in: {
    surfaceNormal: Vector3;
    status: ShotStatus;
    layers: ShotLayer[];
  };
  out?: {
    surfaceNormal: Vector3;
    status: ShotStatus;
    layers: ShotLayer[];
  };
};

export type ShotStatus = 'penetration' | 'blocked' | 'ricochet' | 'splash';

export type ArmorPiercingLayer =
  | {
      distance: number;
      nominal: number;
      angled: number;
      ricochet: boolean;
      type: 'core' | 'spaced' | 'external';
    }
  | {
      type: 'gap';
      gap: number;
    };

export enum TankopediaRelativeAgainst {
  Class,
  Tier,
  All,
}

export enum ShootingRangeZoom {
  Arcade,
  Zoom0,
  Zoom1,
  Zoom2,
}

export const SHOOTING_RANGE_ZOOM_COEFFICIENTS: Record<
  ShootingRangeZoom,
  number
> = {
  [ShootingRangeZoom.Arcade]: 1,
  [ShootingRangeZoom.Zoom0]: 1 / 8,
  [ShootingRangeZoom.Zoom1]: 1 / 16,
  [ShootingRangeZoom.Zoom2]: 1 / 25,
};

interface TankopediaEphemeral {
  thicknessRange: number;
  shot?: Shot;
  shootingRangeZoom: ShootingRangeZoom;
  skills: Record<string, number>;
  relativeAgainst: TankopediaRelativeAgainst;
  controlsEnabled: boolean;
  armor: TankArmor;
  editStatic: boolean;
  highlightArmor?: {
    editingPlate: boolean;
    name: string;
    point: Vector3;
    thickness: number;
    color: string;
  } & (
    | {
        type: ArmorType.Primary | ArmorType.Spaced;
        thicknessAngled: number;
        angle: number;
      }
    | { type: ArmorType.External }
  );
  xpMultiplier: (typeof XP_MULTIPLIERS)[number];
  customShell?: ShellDefinition;
  display: TankopediaDisplay;
}

const skillDefinitions = await awaitableSkillDefinitions;

export const TankopediaEphemeral = createContextualStore(
  ({ armor, thicknessRange }: { armor: TankArmor; thicknessRange: number }) => {
    return create<TankopediaEphemeral>()(
      subscribeWithSelector<TankopediaEphemeral>(() => ({
        thicknessRange,
        shootingRangeZoom: ShootingRangeZoom.Arcade,
        relativeAgainst: TankopediaRelativeAgainst.Class,
        editStatic: false,
        skills: createDefaultSkills(skillDefinitions),
        armor,
        controlsEnabled: true,
        xpMultiplier: 1,
        display: TankopediaDisplay.StaticArmor,
      })),
    );
  },
);

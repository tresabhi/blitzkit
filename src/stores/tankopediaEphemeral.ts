'use client';

import { Vector3 } from 'three';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { ArmorType } from '../components/Armor/components/SpacedArmorScene';
import { ExternalModuleVariant } from '../components/Armor/components/SpacedArmorSceneComponent';
import { ModelDefinition } from '../core/blitzkit/modelDefinitions';
import { createNextSafeStore } from '../core/zustand/createNextSafeStore';

interface TankopediaEphemeral {
  shot?: Shot;
  skills: Record<string, number>;
  controlsEnabled: boolean;
  model: ModelDefinition;
  highlightArmor?: {
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
}

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

export const { Provider, use, useMutation, useStore } = createNextSafeStore(
  (model: ModelDefinition) =>
    create<TankopediaEphemeral>()(
      subscribeWithSelector<TankopediaEphemeral>(() => ({
        skills: {},
        model,
        controlsEnabled: true,
      })),
    ),
);

import { ShellDefinition, resolveNearPenetration } from '@blitzkit/core';
import { resolvePenetrationCoefficient } from '@blitzkit/core/src/blitzkit/resolvePenetrationCoefficient';
import { useEffect } from 'react';
import {
  AdditiveBlending,
  MeshBasicMaterial,
  Object3D,
  Plane,
  ShaderMaterial,
} from 'three';
import { ArmorUserData, ExternalModuleVariant } from '../..';
import { hasEquipment } from '../../../../../../core/blitzkit/hasEquipment';
import { jsxTree } from '../../../../../../core/blitzkit/jsxTree';
import * as Duel from '../../../../../../stores/duel';
import { ArmorType } from '../../../SpacedArmorScene';
import fragmentShader from './shaders/fragment.glsl';
import vertexShader from './shaders/vertex.glsl';

interface SpacedArmorSubExternalProps {
  node: Object3D;
  thickness: number;
  variant: ExternalModuleVariant;
  clip?: Plane;
}

export function SpacedArmorSubExternal({
  node,
  thickness,
  variant,
  clip,
}: SpacedArmorSubExternalProps) {
  const duelStore = Duel.useStore();
  const material = new ShaderMaterial({
    fragmentShader,
    vertexShader,

    depthTest: true,
    depthWrite: false,
    blending: AdditiveBlending,
    clipping: clip !== undefined,
    ...(clip ? { clippingPlanes: [clip] } : {}),

    uniforms: {
      thickness: { value: null },
      penetration: { value: null },
    },
  });

  useEffect(() => {
    function handleShellChange(shell: ShellDefinition) {
      material.uniforms.penetration.value = resolveNearPenetration(
        shell.penetration,
      );
    }
    async function handleProtagonistEquipmentChange(
      equipment: Duel.EquipmentMatrix,
    ) {
      const duel = duelStore.getState();
      const hasEnhancedArmor = await hasEquipment(
        110,
        duel.protagonist.tank.equipment,
        equipment,
      );
      material.uniforms.thickness.value = hasEnhancedArmor
        ? thickness * 1.03
        : thickness;
    }
    async function handleAntagonistEquipmentChange(
      equipment: Duel.EquipmentMatrix,
    ) {
      const duel = duelStore.getState();
      const shell = duel.antagonist.shell;
      const penetration = resolveNearPenetration(shell.penetration);
      const hasCalibratedShells = await hasEquipment(
        103,
        duel.antagonist.tank.equipment,
        equipment,
      );

      material.uniforms.penetration.value =
        penetration *
        resolvePenetrationCoefficient(hasCalibratedShells, shell.type);
    }

    handleShellChange(duelStore.getState().antagonist.shell);
    handleProtagonistEquipmentChange(
      duelStore.getState().protagonist.equipmentMatrix,
    );
    handleAntagonistEquipmentChange(
      duelStore.getState().antagonist.equipmentMatrix,
    );

    const unsubscribes = [
      duelStore.subscribe((state) => state.antagonist.shell, handleShellChange),
      duelStore.subscribe(
        (state) => state.protagonist.equipmentMatrix,
        handleProtagonistEquipmentChange,
      ),
      duelStore.subscribe(
        (state) => state.antagonist.equipmentMatrix,
        handleAntagonistEquipmentChange,
      ),
    ];

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  });

  return (
    <>
      {jsxTree(
        node,
        {
          mesh: {
            renderOrder: 3,
            material: new MeshBasicMaterial({
              colorWrite: false,
              depthTest: true,
              depthWrite: true,
              ...(clip ? { clippingPlanes: [clip] } : {}),
            }),
            onClick() {},
            userData: {
              type: ArmorType.External,
              thickness,
              variant,
            } satisfies ArmorUserData,
          },
        },
        `${node.uuid}-exclude`,
      )}

      {jsxTree(
        node,
        { mesh: { renderOrder: 4, material } },
        `${node.uuid}-include`,
      )}
    </>
  );
}

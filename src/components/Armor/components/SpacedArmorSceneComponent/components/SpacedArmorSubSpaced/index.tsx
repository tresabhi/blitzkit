import { resolveNearPenetration } from '@blitzkit/core/src/blitzkit/resolveNearPenetration';
import { useEffect } from 'react';
import {
  AdditiveBlending,
  MeshBasicMaterial,
  Object3D,
  ShaderMaterial,
} from 'three';
import { degToRad } from 'three/src/math/MathUtils';
import { ArmorUserData } from '../..';
import * as Duel from '../../../../../../../packages/website/src/stores/duel';
import { isExplosive } from '../../../../../../core/blitz/isExplosive';
import { resolvePenetrationCoefficient } from '../../../../../../core/blitz/resolvePenetrationCoefficient';
import { hasEquipment } from '../../../../../../core/blitzkit/hasEquipment';
import { jsxTree } from '../../../../../../core/blitzkit/jsxTree';
import { ShellDefinition } from '../../../../../../core/blitzkit/tankDefinitions';
import { ArmorType } from '../../../SpacedArmorScene';
import fragmentShader from './shaders/fragment.glsl';
import vertexShader from './shaders/vertex.glsl';

interface SpacedArmorSubSpacedProps {
  node: Object3D;
  thickness: number;
}

const depthWriteMaterial = new MeshBasicMaterial({
  depthWrite: true,
  colorWrite: false,
});

export function SpacedArmorSubSpaced({
  node,
  thickness,
}: SpacedArmorSubSpacedProps) {
  const duelStore = Duel.useStore();
  const material = new ShaderMaterial({
    fragmentShader,
    vertexShader,

    depthTest: true,
    depthWrite: false,
    blending: AdditiveBlending,

    uniforms: {
      thickness: { value: null },
      penetration: { value: null },
      caliber: { value: null },
      ricochet: { value: null },
      normalization: { value: null },
    },
  });

  useEffect(() => {
    function handleShellChange(shell: ShellDefinition) {
      material.uniforms.penetration.value = resolveNearPenetration(
        shell.penetration,
      );
      material.uniforms.caliber.value = shell.caliber;
      material.uniforms.ricochet.value = degToRad(
        isExplosive(shell.type) ? 90 : shell.ricochet!,
      );
      material.uniforms.normalization.value = degToRad(
        shell.normalization ?? 0,
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
      const shell = duelStore.getState().antagonist.shell;
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
            renderOrder: 2,
            material,
            onClick() {},
            userData: {
              type: ArmorType.Spaced,
              thickness,
            } satisfies ArmorUserData,
          },
        },
        `${node.uuid}-exclude`,
      )}

      {jsxTree(
        node,
        {
          mesh: {
            renderOrder: 5,
            material: depthWriteMaterial,
          },
        },
        `${node.uuid}-include`,
      )}
    </>
  );
}

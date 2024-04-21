import { useEffect } from 'react';
import {
  AdditiveBlending,
  MeshBasicMaterial,
  Object3D,
  ShaderMaterial,
} from 'three';
import { degToRad } from 'three/src/math/MathUtils';
import { ArmorUserData } from '../..';
import { isExplosive } from '../../../../../../core/blitz/isExplosive';
import { resolveNearPenetration } from '../../../../../../core/blitz/resolveNearPenetration';
import { hasEquipment } from '../../../../../../core/blitzkrieg/hasEquipment';
import { jsxTree } from '../../../../../../core/blitzkrieg/jsxTree';
import { ShellDefinition } from '../../../../../../core/blitzkrieg/tankDefinitions';
import { EquipmentMatrix, useDuel } from '../../../../../../stores/duel';
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
      material.uniforms.ricochet.value = degToRad(shell.ricochet ?? 90);
      material.uniforms.normalization.value = degToRad(
        shell.normalization ?? 0,
      );
    }
    async function handleProtagonistEquipmentChange(
      equipment: EquipmentMatrix,
    ) {
      const duel = useDuel.getState();
      const hasEnhancedArmor = await hasEquipment(
        110,
        duel.protagonist!.tank.equipment,
        equipment,
      );
      material.uniforms.thickness.value = hasEnhancedArmor
        ? thickness * 1.04
        : thickness;
    }
    async function handleAntagonistEquipmentChange(equipment: EquipmentMatrix) {
      const duel = useDuel.getState();
      const shell = useDuel.getState().antagonist!.shell;
      const penetration = resolveNearPenetration(shell.penetration);
      const hasCalibratedShells = await hasEquipment(
        103,
        duel.antagonist!.tank.equipment,
        equipment,
      );
      material.uniforms.penetration.value = hasCalibratedShells
        ? penetration * (isExplosive(shell.type) ? 1.1 : 1.05)
        : penetration;
    }

    handleShellChange(useDuel.getState().antagonist!.shell);
    handleProtagonistEquipmentChange(
      useDuel.getState().protagonist!.equipmentMatrix,
    );
    handleAntagonistEquipmentChange(
      useDuel.getState().antagonist!.equipmentMatrix,
    );

    const unsubscribes = [
      useDuel.subscribe((state) => state.antagonist!.shell, handleShellChange),
      useDuel.subscribe(
        (state) => state.protagonist!.equipmentMatrix,
        handleProtagonistEquipmentChange,
      ),
      useDuel.subscribe(
        (state) => state.antagonist!.equipmentMatrix,
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
          renderOrder: 2,
          material,
          onClick() {},
          userData: {
            type: ArmorType.Spaced,
            thickness,
          } satisfies ArmorUserData,
        },
        node.uuid,
      )}

      {jsxTree(
        node,
        {
          renderOrder: 5,
          material: depthWriteMaterial,
        },
        node.uuid,
      )}
    </>
  );
}

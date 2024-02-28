import { useEffect } from 'react';
import {
  AdditiveBlending,
  MeshBasicMaterial,
  Object3D,
  ShaderMaterial,
} from 'three';
import { degToRad } from 'three/src/math/MathUtils';
import { resolveNearPenetration } from '../../../../../../core/blitz/resolveNearPenetration';
import { hasEquipment } from '../../../../../../core/blitzkrieg/hasEquipment';
import { jsxTree } from '../../../../../../core/blitzkrieg/jsxTree';
import { ShellDefinition } from '../../../../../../core/blitzkrieg/tankDefinitions';
import { EquipmentMatrix, useDuel } from '../../../../../../stores/duel';
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
    async function handleEquipmentChange(equipment: EquipmentMatrix) {
      const hasEnhancedArmor = await hasEquipment(110, false, equipment);
      material.uniforms.thickness.value = hasEnhancedArmor
        ? thickness * 1.04
        : thickness;
    }

    handleShellChange(useDuel.getState().antagonist!.shell);
    handleEquipmentChange(useDuel.getState().protagonist!.equipment);

    const unsubscribes = [
      useDuel.subscribe((state) => state.antagonist!.shell, handleShellChange),
      useDuel.subscribe(
        (state) => state.protagonist!.equipment,
        handleEquipmentChange,
      ),
    ];

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  return (
    <>
      {jsxTree(node, {
        renderOrder: 2,
        material,
      })}
      {jsxTree(node, {
        renderOrder: 5,
        material: depthWriteMaterial,
      })}
    </>
  );
}

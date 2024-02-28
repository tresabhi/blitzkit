import { useEffect } from 'react';
import {
  AdditiveBlending,
  MeshBasicMaterial,
  Object3D,
  ShaderMaterial,
} from 'three';
import { resolveNearPenetration } from '../../../../../../core/blitz/resolveNearPenetration';
import { hasEquipment } from '../../../../../../core/blitzkrieg/hasEquipment';
import { jsxTree } from '../../../../../../core/blitzkrieg/jsxTree';
import { ShellDefinition } from '../../../../../../core/blitzkrieg/tankDefinitions';
import { EquipmentMatrix, useDuel } from '../../../../../../stores/duel';
import fragmentShader from './shaders/fragment.glsl';
import vertexShader from './shaders/vertex.glsl';

interface SpacedArmorSubExternalProps {
  node: Object3D;
  thickness: number;
}

export function SpacedArmorSubExternal({
  node,
  thickness,
}: SpacedArmorSubExternalProps) {
  const material = new ShaderMaterial({
    fragmentShader,
    vertexShader,

    depthTest: true,
    depthWrite: false,
    blending: AdditiveBlending,

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
        renderOrder: 3,
        material: new MeshBasicMaterial({
          colorWrite: false,
          depthTest: true,
          depthWrite: true,
        }),
      })}
      {jsxTree(node, {
        renderOrder: 4,
        material,
      })}
    </>
  );
}

import { useEffect } from 'react';
import {
  AdditiveBlending,
  MeshBasicMaterial,
  Object3D,
  ShaderMaterial,
} from 'three';
import { degToRad } from 'three/src/math/MathUtils';
import { resolveNearPenetration } from '../../../../../../core/blitz/resolveNearPenetration';
import { jsxTree } from '../../../../../../core/blitzkrieg/jsxTree';
import { ShellDefinition } from '../../../../../../core/blitzkrieg/tankDefinitions';
import { useDuel } from '../../../../../../stores/duel';
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
      thickness: { value: thickness },
      penetration: { value: null },
      caliber: { value: null },
      ricochet: { value: null },
      normalization: { value: null },
    },
  });

  useEffect(() => {
    function handleChange(shell: ShellDefinition) {
      material.uniforms.penetration.value = resolveNearPenetration(
        shell.penetration,
      );
      material.uniforms.caliber.value = shell.caliber;
      material.uniforms.ricochet.value = degToRad(shell.ricochet ?? 90);
      material.uniforms.normalization.value = degToRad(
        shell.normalization ?? 0,
      );
    }

    handleChange(useDuel.getState().antagonist!.shell);
    return useDuel.subscribe((state) => state.antagonist!.shell, handleChange);
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

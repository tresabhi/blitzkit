import { useEffect } from 'react';
import {
  AdditiveBlending,
  MeshBasicMaterial,
  Object3D,
  ShaderMaterial,
} from 'three';
import { resolveNearPenetration } from '../../../../../../core/blitz/resolveNearPenetration';
import { jsxTree } from '../../../../../../core/blitzkrieg/jsxTree';
import { ShellDefinition } from '../../../../../../core/blitzkrieg/tankDefinitions';
import { useDuel } from '../../../../../../stores/duel';
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
      thickness: { value: thickness },
      penetration: { value: null },
    },
  });

  useEffect(() => {
    function handleChange(shell: ShellDefinition) {
      material.uniforms.penetration.value = resolveNearPenetration(
        shell.penetration,
      );
    }

    handleChange(useDuel.getState().antagonist!.shell);
    return useDuel.subscribe((state) => state.antagonist!.shell, handleChange);
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

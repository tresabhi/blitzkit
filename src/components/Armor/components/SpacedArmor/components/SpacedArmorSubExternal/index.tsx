import {
  AdditiveBlending,
  MeshBasicMaterial,
  Object3D,
  ShaderMaterial,
} from 'three';
import { resolveNearPenetration } from '../../../../../../core/blitz/resolveNearPenetration';
import { jsxTree } from '../../../../../../core/blitzkrieg/jsxTree';
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
  const penetration = resolveNearPenetration(
    useDuel.getState().antagonist!.shell.penetration,
  );

  return (
    <>
      {jsxTree(node, {
        renderOrder: 4,
        material: new ShaderMaterial({
          fragmentShader,
          vertexShader,

          depthTest: true,
          depthWrite: false,
          blending: AdditiveBlending,

          uniforms: {
            thickness: { value: thickness },
            penetration: { value: penetration },
          },
        }),
      })}
      {jsxTree(node, {
        renderOrder: 3,
        material: new MeshBasicMaterial({
          colorWrite: false,
          depthTest: true,
          depthWrite: true,
        }),
      })}
    </>
  );
}

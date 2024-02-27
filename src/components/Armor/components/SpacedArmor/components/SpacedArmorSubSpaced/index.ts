import { AdditiveBlending, Object3D, ShaderMaterial } from 'three';
import { degToRad } from 'three/src/math/MathUtils';
import { resolveNearPenetration } from '../../../../../../core/blitz/resolveNearPenetration';
import { jsxTree } from '../../../../../../core/blitzkrieg/jsxTree';
import { useDuel } from '../../../../../../stores/duel';
import fragmentShader from './shaders/fragment.glsl';
import vertexShader from './shaders/vertex.glsl';

interface SpacedArmorSubSpacedProps {
  node: Object3D;
  thickness: number;
}

export function SpacedArmorSubSpaced({
  node,
  thickness,
}: SpacedArmorSubSpacedProps) {
  const { shell } = useDuel.getState().antagonist!;
  const penetration = resolveNearPenetration(shell.penetration);

  return jsxTree(node, {
    renderOrder: 2,
    material: new ShaderMaterial({
      fragmentShader,
      vertexShader,

      depthTest: true,
      depthWrite: false,
      blending: AdditiveBlending,

      uniforms: {
        thickness: { value: thickness },
        penetration: { value: penetration },
        caliber: { value: shell.caliber },
        ricochet: { value: degToRad(shell.ricochet ?? 90) },
        normalization: { value: degToRad(shell.normalization ?? 0) },
      },
    }),
  });
}

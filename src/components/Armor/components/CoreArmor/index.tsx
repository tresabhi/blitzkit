import { useFrame } from '@react-three/fiber';
import {
  MeshBasicMaterial,
  Object3D,
  ShaderMaterial,
  Vector2,
  WebGLRenderTarget,
} from 'three';
import { degToRad } from 'three/src/math/MathUtils';
import { resolveNearPenetration } from '../../../../core/blitz/resolveNearPenetration';
import { jsxTree } from '../../../../core/blitzkrieg/jsxTree';
import { useDuel } from '../../../../stores/duel';
import fragmentShader from './shaders/fragment.glsl';
import vertexShader from './shaders/vertex.glsl';

export const spacedArmorRenderTarget = new WebGLRenderTarget();

interface CoreArmorProps {
  thickness: number;
  node: Object3D;
}

const excludeMaterial = new MeshBasicMaterial({
  colorWrite: false,
});

export function CoreArmor({ node, thickness }: CoreArmorProps) {
  const { shell } = useDuel.getState().antagonist!;
  const penetration = resolveNearPenetration(shell.penetration);
  const material = new ShaderMaterial({
    fragmentShader,
    vertexShader,

    transparent: true,

    uniforms: {
      thickness: { value: thickness },
      penetration: { value: penetration },
      caliber: { value: shell.caliber },
      ricochet: { value: degToRad(shell.ricochet ?? 90) },
      normalization: { value: degToRad(shell.normalization ?? 0) },

      resolution: { value: new Vector2() },
      spacedArmorBuffer: { value: null },
      spacedArmorDepth: { value: null },
    },
  });

  useFrame(({ gl }) => {
    gl.getSize(material.uniforms.resolution.value).multiplyScalar(
      gl.getPixelRatio(),
    );
    material.uniforms.spacedArmorBuffer.value = spacedArmorRenderTarget.texture;
    material.uniforms.spacedArmorDepth.value =
      spacedArmorRenderTarget.depthTexture;
  });

  return (
    <>
      {jsxTree(node, {
        renderOrder: 0,
        material: excludeMaterial,
      })}

      {jsxTree(node, {
        renderOrder: 1,
        material,
      })}
    </>
  );
}

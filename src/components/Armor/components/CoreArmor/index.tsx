import { useFrame } from '@react-three/fiber';
import { useEffect } from 'react';
import {
  MeshBasicMaterial,
  Object3D,
  ShaderMaterial,
  Vector2,
  WebGLRenderTarget,
} from 'three';
import { degToRad } from 'three/src/math/MathUtils';
import { canSplash } from '../../../../core/blitz/canSplash';
import { isExplosive } from '../../../../core/blitz/isExplosive';
import { resolveNearPenetration } from '../../../../core/blitz/resolveNearPenetration';
import { jsxTree } from '../../../../core/blitzkrieg/jsxTree';
import { ShellDefinition } from '../../../../core/blitzkrieg/tankDefinitions';
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
  const material = new ShaderMaterial({
    fragmentShader,
    vertexShader,

    transparent: true,

    uniforms: {
      thickness: { value: thickness },
      penetration: { value: null },
      caliber: { value: null },
      ricochet: { value: null },
      normalization: { value: null },
      isExplosive: { value: null },
      canSplash: { value: null },
      damage: { value: null },
      explosionRadius: { value: null },

      resolution: { value: new Vector2() },
      spacedArmorBuffer: { value: null },
      spacedArmorDepth: { value: null },
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
      material.uniforms.isExplosive.value = isExplosive(shell.type);
      material.uniforms.canSplash.value = canSplash(shell.type);
      material.uniforms.damage.value = shell.damage.armor;
      material.uniforms.explosionRadius.value = shell.explosionRadius;
    }

    handleChange(useDuel.getState().antagonist!.shell);
    return useDuel.subscribe((state) => state.antagonist!.shell, handleChange);
  }, []);

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

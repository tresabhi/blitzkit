import { MeshProps, useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import { MeshStandardMaterial, ShaderMaterial, Vector2 } from 'three';
import ThreeCustomShaderMaterial from 'three-custom-shader-material';
import { degToRad } from 'three/src/math/MathUtils';
import { Duel } from '../../../../app/tools/tankopedia/[id]/page';
import { canSplash } from '../../../../core/blitz/canSplash';
import { isExplosive } from '../../../../core/blitz/isExplosive';
import { resolveNearPenetration } from '../../../../core/blitz/resolveNearPenetration';
import { useTankopediaTemporary } from '../../../../stores/tankopedia';
import { externalModuleMaskRenderTarget } from '../ExternalModuleMask';
import { spacedArmorDepthRenderTarget } from '../SpacedArmorDepth';
import fragmentShader from './shaders/fragment.glsl';
import vertexShader from './shaders/vertex.glsl';

interface ArmorMeshProps extends MeshProps {
  duel: Duel;
  thickness: number;
  maxThickness: number;
}

export function ArmorMesh({
  thickness,
  maxThickness,
  duel,
  ...props
}: ArmorMeshProps) {
  const equipment = useTankopediaTemporary((draft) => draft.model.equipment);
  const camera = useThree((state) => state.camera);
  const { shell } = duel.antagonist;
  const greenPenetration = useTankopediaTemporary(
    (state) => state.model.visual.greenPenetration,
  );
  const material = useRef<ShaderMaterial>(null);
  const resolution = new Vector2();
  const explosionCapable = isExplosive(shell.type);
  let mutatedThickness = thickness;
  let penetration = resolveNearPenetration(shell.penetration);

  if (equipment.calibratedShells) penetration *= explosionCapable ? 1.1 : 1.05;
  if (equipment.enhancedArmor) mutatedThickness *= 1.04;

  useFrame(({ gl, camera }) => {
    if (material.current) {
      material.current.uniforms.resolution.value = resolution.set(
        gl.domElement.width,
        gl.domElement.height,
      );
      material.current.uniforms.externalModuleMask.value =
        externalModuleMaskRenderTarget.texture;
      material.current.uniforms.spacedArmorDepth.value =
        spacedArmorDepthRenderTarget.depthTexture;
      material.current.uniforms.spacedArmorMask.value =
        spacedArmorDepthRenderTarget.texture;
      material.current.uniforms.projectionMatrixInverse.value =
        camera.projectionMatrixInverse;
    }
  });

  return (
    <>
      <mesh {...props} renderOrder={0}>
        <meshBasicMaterial colorWrite={false} />
      </mesh>

      <mesh {...props} renderOrder={1}>
        <ThreeCustomShaderMaterial
          ref={material}
          silent
          baseMaterial={MeshStandardMaterial}
          transparent
          depthWrite={false}
          fragmentShader={fragmentShader}
          vertexShader={vertexShader}
          uniforms={{
            resolution: { value: null },
            externalModuleMask: { value: null },
            spacedArmorDepth: { value: null },
            spacedArmorMask: { value: null },
            projectionMatrixInverse: { value: null },
            zNear: { value: camera.near },
            zFar: { value: camera.far },
            greenPenetration: { value: greenPenetration },
            maxThickness: { value: maxThickness },
            isExplosive: { value: explosionCapable },
            canSplash: { value: canSplash(shell.type) },
            thickness: { value: mutatedThickness },
            penetration: {
              value: penetration,
            },
            caliber: { value: shell.caliber },
            ricochetAngle: { value: degToRad(shell.ricochet ?? 90) },
            normalization: {
              value: degToRad(shell.normalization ?? 0),
            },
            damage: { value: shell.damage.armor },
            explosionRadius: { value: shell.explosionRadius ?? 0 },
          }}
        />
      </mesh>
    </>
  );
}

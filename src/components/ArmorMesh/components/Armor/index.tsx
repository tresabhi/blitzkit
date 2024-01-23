import { MeshProps, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { MeshStandardMaterial, ShaderMaterial, Vector2 } from 'three';
import ThreeCustomShaderMaterial from 'three-custom-shader-material';
import { degToRad } from 'three/src/math/MathUtils';
import { canSplash } from '../../../../core/blitz/canSplash';
import { isExplosive } from '../../../../core/blitz/isExplosive';
import { resolveNearPenetration } from '../../../../core/blitz/resolveNearPenetration';
import { useDuel } from '../../../../stores/duel';
import { useTankopediaPersistent } from '../../../../stores/tankopedia';
import { externalModuleMaskRenderTarget } from '../ExternalModuleMask';
import { spacedArmorDepthRenderTarget } from '../SpacedArmorDepth';
import fragmentShader from './shaders/fragment.glsl';
import vertexShader from './shaders/vertex.glsl';

interface ArmorMeshProps extends MeshProps {
  thickness: number;
  maxThickness: number;
}

export function ArmorMesh({
  thickness,
  maxThickness,
  ...props
}: ArmorMeshProps) {
  const initialEquipment = useTankopediaPersistent.getState().model.equipment;
  const camera = useThree((state) => state.camera);
  const shell = useDuel((state) => state.antagonist!.shell);
  const greenPenetration = useTankopediaPersistent(
    (state) => state.model.visual.greenPenetration,
  );
  const material = useRef<ShaderMaterial>(null);
  const resolution = new Vector2();
  const explosionCapable = isExplosive(shell.type);

  useEffect(() => {
    function updateQuickEquipments() {
      const equipment = useTankopediaPersistent.getState().model.equipment;
      const nearPenetration = resolveNearPenetration(shell.penetration);

      if (material.current) {
        material.current.uniforms.thickness.value =
          thickness * (equipment.enhancedArmor ? 1.04 : 1);
        material.current.uniforms.penetration.value =
          nearPenetration *
          (equipment.calibratedShells ? (explosionCapable ? 1.1 : 1.05) : 1);
      }
    }

    const unsubscribes = [
      useTankopediaPersistent.subscribe(
        (state) => state.model.equipment,
        updateQuickEquipments,
      ),
    ];

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  });

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
            thickness: {
              value: thickness * (initialEquipment.enhancedArmor ? 1.04 : 1),
            },
            penetration: {
              value:
                resolveNearPenetration(shell.penetration) *
                (initialEquipment.calibratedShells
                  ? explosionCapable
                    ? 1.1
                    : 1.05
                  : 1),
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

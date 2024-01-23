import { MeshProps, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { ShaderMaterial, Vector2 } from 'three';
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
  const camera = useThree((state) => state.camera);
  const initialShell = useDuel.getState().antagonist!.shell;
  const initialTankopedia = useTankopediaPersistent.getState();
  const material = useRef<ShaderMaterial>(null);
  const resolution = new Vector2();
  const explosionCapable = isExplosive(initialShell.type);

  useEffect(() => {
    function updateQuickEquipments() {
      const equipment = useTankopediaPersistent.getState().model.equipment;
      const shell = useDuel.getState().antagonist!.shell;
      const nearPenetration = resolveNearPenetration(shell.penetration);

      if (material.current) {
        material.current.uniforms.thickness.value =
          thickness * (equipment.enhancedArmor ? 1.04 : 1);
        material.current.uniforms.penetration.value =
          nearPenetration *
          (equipment.calibratedShells ? (explosionCapable ? 1.1 : 1.05) : 1);
      }
    }

    function updateShellProperties() {
      const shell = useDuel.getState().antagonist!.shell;
      if (material.current) {
        material.current.uniforms.isExplosive.value = isExplosive(shell.type);
        material.current.uniforms.canSplash.value = canSplash(shell.type);
        material.current.uniforms.caliber.value = shell.caliber;
        material.current.uniforms.ricochetAngle.value = degToRad(
          shell.ricochet ?? 90,
        );
        material.current.uniforms.damage.value = shell.damage.armor;
        material.current.uniforms.explosionRadius.value =
          shell.explosionRadius ?? 0;
      }

      updateQuickEquipments();
    }

    const unsubscribes = [
      useTankopediaPersistent.subscribe(
        (state) => state.model.equipment,
        updateQuickEquipments,
      ),
      useDuel.subscribe(
        (state) => state.antagonist!.shell,
        updateShellProperties,
      ),
      useTankopediaPersistent.subscribe(
        (state) => state.model.visual.greenPenetration,
        (greenPenetration) => {
          if (material.current) {
            material.current.uniforms.greenPenetration.value = greenPenetration;
          }
        },
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
        <shaderMaterial
          ref={material}
          fragmentShader={fragmentShader}
          vertexShader={vertexShader}
          transparent
          depthWrite={false}
          uniforms={{
            resolution: { value: null },
            externalModuleMask: { value: null },
            spacedArmorDepth: { value: null },
            spacedArmorMask: { value: null },
            projectionMatrixInverse: { value: null },
            zNear: { value: camera.near },
            zFar: { value: camera.far },
            greenPenetration: {
              value: initialTankopedia.model.visual.greenPenetration,
            },
            maxThickness: { value: maxThickness },
            isExplosive: { value: explosionCapable },
            canSplash: { value: canSplash(initialShell.type) },
            thickness: {
              value:
                thickness *
                (initialTankopedia.model.equipment.enhancedArmor ? 1.04 : 1),
            },
            penetration: {
              value:
                resolveNearPenetration(initialShell.penetration) *
                (initialTankopedia.model.equipment.calibratedShells
                  ? explosionCapable
                    ? 1.1
                    : 1.05
                  : 1),
            },
            caliber: { value: initialShell.caliber },
            ricochetAngle: { value: degToRad(initialShell.ricochet ?? 90) },
            normalization: {
              value: degToRad(initialShell.normalization ?? 0),
            },
            damage: { value: initialShell.damage.armor },
            explosionRadius: { value: initialShell.explosionRadius ?? 0 },
          }}
        />
      </mesh>
    </>
  );
}

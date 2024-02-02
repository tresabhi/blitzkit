import { MeshProps, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { IUniform, Mesh, ShaderMaterial, Vector2, Vector3 } from 'three';
import { degToRad } from 'three/src/math/MathUtils';
import { I_HAT } from '../../../../constants/axis';
import { canSplash } from '../../../../core/blitz/canSplash';
import { isExplosive } from '../../../../core/blitz/isExplosive';
import { resolveNearPenetration } from '../../../../core/blitz/resolveNearPenetration';
import { useDuel } from '../../../../stores/duel';
import {
  ArmorPiercingLayer,
  mutateTankopediaTemporary,
  useTankopediaPersistent,
} from '../../../../stores/tankopedia';
import { externalModuleMaskRenderTarget } from '../ExternalModuleMask';
import { spacedArmorDepthRenderTarget } from '../SpacedArmorDepth';
import fragmentShader from './shaders/fragment.glsl';
import vertexShader from './shaders/vertex.glsl';

interface ArmorMeshProps extends MeshProps {
  thickness: number;
  maxThickness: number;
}

export type ArmorMeshUserData = {
  type: 'coreArmor' | 'spacedArmor' | 'externalModule';
  thickness: number;
};

export function ArmorMesh({
  thickness,
  maxThickness,
  ...props
}: ArmorMeshProps) {
  const camera = useThree((state) => state.camera);
  const initialShell = useDuel.getState().antagonist!.shell;
  const initialTankopedia = useTankopediaPersistent.getState();
  const material = useRef<ShaderMaterial>(null);
  const explosionCapable = isExplosive(initialShell.type);
  const cameraNormal = new Vector3();
  const shellNormal = new Vector3();
  const surfaceNormal = new Vector3();
  const mesh = useRef<Mesh>(null);

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
      gl.getSize(material.current.uniforms.resolution.value);

      (
        material.current.uniforms.resolution as IUniform<Vector2>
      ).value.multiplyScalar(gl.getPixelRatio());

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

      <mesh
        {...props}
        renderOrder={1}
        userData={
          {
            type: 'coreArmor',
            thickness,
          } satisfies ArmorMeshUserData
        }
        ref={mesh}
        onClick={(event) => {
          // if (useTankopediaTemporary.getState().mode !== 'armor') return;

          shellNormal.copy(
            cameraNormal.copy(camera.position).sub(event.point).normalize(),
          );
          surfaceNormal.copy(event.normal!).applyAxisAngle(I_HAT, -Math.PI / 2);
          const angle = Math.acos(surfaceNormal.dot(shellNormal));
          const shell = useDuel.getState().antagonist!.shell;
          const intersections = event.intersections
            .filter(({ object }) => Boolean(object.userData.type))
            .map(
              (event) =>
                event as typeof event & {
                  object: (typeof event)['object'] & {
                    userData: ArmorMeshUserData;
                  };
                },
            );
          const intersectionsTillFirstCoreArmor = intersections.slice(
            0,
            intersections.findIndex(
              ({ object }) => object.userData.type === 'coreArmor',
            ) + 1,
          );
          const coreArmorMesh = intersectionsTillFirstCoreArmor.at(-1)!.object;

          if (mesh.current !== (coreArmorMesh as unknown as Mesh)) return;

          let accumulatedThickness = 0;
          const armorPiercingLayers = intersectionsTillFirstCoreArmor.map(
            (event, index) => {
              switch (event.object.userData.type) {
                case 'spacedArmor': {
                  accumulatedThickness += event.object.userData.thickness;

                  return {
                    nominal: event.object.userData.thickness,
                    angled: event.object.userData.thickness,
                    ricochet: false,
                    block:
                      accumulatedThickness >
                      resolveNearPenetration(shell.penetration),
                    type: 'external',
                  } satisfies ArmorPiercingLayer;
                }

                case 'externalModule':
                case 'coreArmor': {
                  const threeCalibersRule =
                    shell.caliber > 3 * event.object.userData.thickness;
                  let ricochet = false;

                  if (
                    index === 0 &&
                    !isExplosive(shell.type) &&
                    !threeCalibersRule &&
                    angle >= degToRad(shell.ricochet!)
                  ) {
                    ricochet = true;
                  }

                  const twoCalibersRule =
                    shell.caliber > 2 * event.object.userData.thickness;
                  const normalization = twoCalibersRule
                    ? ((shell.normalization ?? 0) * 1.4 * shell.caliber) /
                      (2 * thickness)
                    : shell.normalization ?? 0;
                  const angled =
                    thickness / Math.cos(angle - degToRad(normalization));
                  accumulatedThickness += angled;

                  return {
                    nominal: event.object.userData.thickness,
                    angled,
                    ricochet,
                    block:
                      accumulatedThickness >
                      resolveNearPenetration(shell.penetration),
                    type:
                      event.object.userData.type === 'coreArmor'
                        ? 'core'
                        : 'spaced',
                  } satisfies ArmorPiercingLayer;
                }
              }
            },
          );

          const hasRicochet = armorPiercingLayers.some(
            ({ ricochet }) => ricochet,
          );
          const hasPenetrated =
            resolveNearPenetration(shell.penetration) >= accumulatedThickness;

          mutateTankopediaTemporary((draft) => {
            draft.shot = {
              type: hasRicochet
                ? 'ricochet'
                : hasPenetrated
                  ? 'penetration'
                  : 'block',
              point: event.point.toArray(),
              thicknesses: armorPiercingLayers,
              shellNormal: shellNormal.toArray(),
              surfaceNormal: surfaceNormal.toArray(),
              angle,
            };
          });
        }}
      >
        <shaderMaterial
          ref={material}
          fragmentShader={fragmentShader}
          vertexShader={vertexShader}
          transparent
          depthWrite={false}
          uniforms={{
            resolution: { value: new Vector2() },
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

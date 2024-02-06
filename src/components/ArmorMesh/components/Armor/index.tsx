import { MeshProps, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import {
  IUniform,
  Mesh,
  Quaternion,
  Raycaster,
  ShaderMaterial,
  Vector2,
  Vector3,
} from 'three';
import { degToRad } from 'three/src/math/MathUtils';
import { canRicochet } from '../../../../core/blitz/canRicochet';
import { canSplash } from '../../../../core/blitz/canSplash';
import { isExplosive } from '../../../../core/blitz/isExplosive';
import { resolveNearPenetration } from '../../../../core/blitz/resolveNearPenetration';
import { useDuel } from '../../../../stores/duel';
import {
  ArmorPiercingLayer,
  Shot,
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
  const ricochetCapable = canRicochet(initialShell.type);
  const cameraNormal = new Vector3();
  const shellNormal = new Vector3();
  const surfaceNormal = new Vector3();
  const mesh = useRef<Mesh>(null);
  const scene = useThree((state) => state.scene);

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
        material.current.uniforms.canRicochet.value = canRicochet(shell.type);
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
          surfaceNormal
            .copy(event.normal!)
            .applyQuaternion(event.object.getWorldQuaternion(new Quaternion()));
          const equipment = useTankopediaPersistent.getState().model.equipment;
          const angle = Math.acos(surfaceNormal.dot(shellNormal));
          const shell = useDuel.getState().antagonist!.shell;
          const resolvedPenetration =
            resolveNearPenetration(shell.penetration) *
            (equipment.calibratedShells
              ? isExplosive(shell.type)
                ? 1.1
                : 1.05
              : 1);
          const indexedObjects = new Set<ArmorMeshUserData['type']>();
          const intersections = event.intersections
            .filter(({ object }) => Boolean(object.userData.type))
            .map((event) => {
              const typedEvent = event as typeof event & {
                object: (typeof event)['object'] & {
                  userData: ArmorMeshUserData;
                };
              };

              return typedEvent;
            })
            .filter(({ object }) => {
              if (indexedObjects.has(object.userData.type)) return false;
              indexedObjects.add(object.userData.type);
              return true;
            });
          const intersectionsTillFirstCoreArmor = intersections.slice(
            0,
            intersections.findIndex(
              ({ object }) => object.userData.type === 'coreArmor',
            ) + 1,
          );
          const coreArmorMesh = intersectionsTillFirstCoreArmor.at(-1)!.object;
          const thicknessCoefficient = equipment.enhancedArmor ? 1.04 : 1;

          if (mesh.current !== (coreArmorMesh as unknown as Mesh)) return;

          let hasRicochet = false;
          const armorPiercingLayersRaw = intersectionsTillFirstCoreArmor
            .map((event, index) => {
              if (hasRicochet) return null;

              switch (event.object.userData.type) {
                case 'externalModule': {
                  return {
                    nominal:
                      event.object.userData.thickness * thicknessCoefficient,
                    angled:
                      event.object.userData.thickness * thicknessCoefficient,
                    type: 'external',
                    distance: event.distance,
                    ricochet: false,
                  } satisfies ArmorPiercingLayer;
                }

                case 'spacedArmor':
                case 'coreArmor': {
                  const threeCalibersRule =
                    shell.caliber >
                    3 *
                      (event.object.userData.thickness * thicknessCoefficient);

                  if (
                    index === 0 &&
                    canRicochet(shell.type) &&
                    !threeCalibersRule &&
                    angle >= degToRad(shell.ricochet!)
                  ) {
                    hasRicochet = true;
                  }

                  const twoCalibersRule =
                    shell.caliber >
                    2 *
                      (event.object.userData.thickness * thicknessCoefficient);
                  const normalization = twoCalibersRule
                    ? ((shell.normalization ?? 0) * 1.4 * shell.caliber) /
                      (2 *
                        event.object.userData.thickness *
                        thicknessCoefficient)
                    : shell.normalization ?? 0;
                  const angled =
                    (event.object.userData.thickness * thicknessCoefficient) /
                    Math.cos(angle - degToRad(normalization));

                  return {
                    ricochet: hasRicochet,
                    nominal:
                      event.object.userData.thickness * thicknessCoefficient,
                    angled,
                    type:
                      event.object.userData.type === 'coreArmor'
                        ? 'core'
                        : 'spaced',
                    distance: event.distance,
                  } satisfies ArmorPiercingLayer;
                }
              }
            })
            .filter(Boolean);
          const gaps = armorPiercingLayersRaw.map((layerA, aIndex) => {
            if (aIndex === armorPiercingLayersRaw.length - 1) return null;
            const layerB = armorPiercingLayersRaw[aIndex + 1];

            return {
              type: 'gap',
              gap: Math.abs(layerB.distance - layerA.distance),
            } satisfies ArmorPiercingLayer;
          });
          const armorPiercingLayers: ArmorPiercingLayer[] = [];

          armorPiercingLayersRaw.forEach((layer, index) => {
            const gap = gaps[index];

            armorPiercingLayers.push(layer);
            if (gap) armorPiercingLayers.push(gap);
          });

          let remainingPenetration = resolvedPenetration;
          const explosiveCapable = isExplosive(shell.type);

          armorPiercingLayers.forEach((layer) => {
            if (layer.type !== 'gap') {
              if (layer.ricochet) {
                remainingPenetration *= 0.75;
              } else {
                remainingPenetration -= layer.angled;
              }
            } else if (explosiveCapable) {
              // there is a 50% penetration loss per meter for HE based shells
              remainingPenetration -= 0.5 * remainingPenetration * layer.gap;
            }

            remainingPenetration = Math.max(0, remainingPenetration);
          });

          const hasPenetrated = remainingPenetration > 0;
          let ricochet: Shot['ricochet'] = undefined;

          if (hasRicochet) {
            const raycaster = new Raycaster();
            const bounceNormal = shellNormal
              .clone()
              .multiplyScalar(-1)
              .sub(
                surfaceNormal
                  .clone()
                  .multiplyScalar(
                    2 *
                      surfaceNormal.dot(shellNormal.clone().multiplyScalar(-1)),
                  ),
              );
            raycaster.set(event.point, bounceNormal);
            const intersections = raycaster
              .intersectObjects(scene.children, true)
              .filter(
                (intersection) =>
                  typeof intersection.object.userData?.type === 'string',
              );
            const indexOfCoreArmor = intersections.findIndex(
              ({ object }) => object.userData.type === 'coreArmor',
            );
            const intersectionsTillFirstCoreArmor = intersections.slice(
              0,
              indexOfCoreArmor + 1,
            );

            if (intersectionsTillFirstCoreArmor.length > 0) {
              intersectionsTillFirstCoreArmor.forEach((intersection) => {
                switch (intersection.object.userData.type) {
                  case 'externalModule': {
                    remainingPenetration -=
                      intersection.object.userData.thickness;
                    break;
                  }

                  case 'spacedArmor':
                  case 'coreArmor': {
                    const angle = bounceNormal.angleTo(
                      intersection.object.position.clone().sub(event.point),
                    );
                    const twoCalibersRule =
                      shell.caliber >
                      2 *
                        (intersection.object.userData.thickness *
                          thicknessCoefficient);
                    const normalization = twoCalibersRule
                      ? ((shell.normalization ?? 0) * 1.4 * shell.caliber) /
                        (2 *
                          intersection.object.userData.thickness *
                          thicknessCoefficient)
                      : shell.normalization ?? 0;
                    const angled =
                      (intersection.object.userData.thickness *
                        thicknessCoefficient) /
                      Math.cos(angle - degToRad(normalization));

                    remainingPenetration -= angled;
                  }
                }
              });

              ricochet = {
                point: intersectionsTillFirstCoreArmor.at(-1)!.point.toArray(),
                distance: intersectionsTillFirstCoreArmor.at(-1)!.distance,
                penetration: remainingPenetration > 0,
              };
            }
          }

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
              ricochet,
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
            canRicochet: { value: ricochetCapable },
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

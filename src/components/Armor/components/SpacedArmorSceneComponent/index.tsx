import { useThree } from '@react-three/fiber';
import {
  Intersection,
  MeshBasicMaterial,
  Object3D,
  Plane,
  Quaternion,
  Scene,
} from 'three';
import { degToRad } from 'three/src/math/MathUtils';
import { isExplosive } from '../../../../core/blitz/isExplosive';
import { resolveNearPenetration } from '../../../../core/blitz/resolveNearPenetration';
import { resolvePenetrationCoefficient } from '../../../../core/blitz/resolvePenetrationCoefficient';
import { hasEquipment } from '../../../../core/blitzkit/hasEquipment';
import { jsxTree } from '../../../../core/blitzkit/jsxTree';
import { ShellType } from '../../../../core/blitzkit/tankDefinitions';
import { useDuel } from '../../../../stores/duel';
import {
  Shot,
  ShotLayerBase,
  useTankopediaTemporary,
} from '../../../../stores/tankopedia';
import { ArmorType } from '../SpacedArmorScene';
import { SpacedArmorSubExternal } from './components/SpacedArmorSubExternal';
import { SpacedArmorSubSpaced } from './components/SpacedArmorSubSpaced';

type SpacedArmorSceneComponentProps = {
  node: Object3D;
  thickness: number;
  scene: Scene;
  clip?: Plane;
} & (
  | {
      type: Exclude<ArmorType, ArmorType.External>;
    }
  | {
      type: ArmorType.External;
      variant: ExternalModuleVariant;
    }
);

export type ExternalModuleVariant = 'gun' | 'track';
export type ArmorUserData = {
  thickness: number;
} & (
  | {
      type: Exclude<ArmorType, ArmorType.External>;
    }
  | {
      type: ArmorType.External;
      variant: ExternalModuleVariant;
    }
);
type ArmorMeshIntersection = Intersection & {
  object: Object3D & { userData: ArmorUserData };
};

const omitMaterial = new MeshBasicMaterial({
  colorWrite: false,
  depthWrite: true,
});

/**
 * Render orders allocations:
 * - 0  : core omission
 * - 1-2: spaced without depth buffer write but do test to allow additive blending
 * - 3-4: external with depth buffer write in first pass and read in second to simplify geometry
 * - 5  : spaced depth write
 */
export function SpacedArmorSceneComponent({
  node,
  thickness,
  scene,
  clip,
  ...props
}: SpacedArmorSceneComponentProps) {
  const camera = useThree((state) => state.camera);

  return (
    <>
      {props.type === ArmorType.Core &&
        jsxTree(
          node,
          {
            renderOrder: 0,
            material: omitMaterial,
            userData: {
              type: ArmorType.Core,
              thickness,
            } satisfies ArmorUserData,

            async onClick(event) {
              event.stopPropagation();

              const shot: Shot = {
                status: 'blocked',
                damage: -1,
                layersIn: [],
                point: event.point,
              };
              const { antagonist, protagonist } = useDuel.getState();
              const shell = antagonist!.shell;
              const cameraNormal = camera.position
                .clone()
                .sub(event.point)
                .normalize();

              const hasCalibratedShells = await hasEquipment(
                103,
                protagonist!.tank.equipment,
                protagonist!.equipmentMatrix,
              );
              const hasEnhancedArmor = await hasEquipment(
                110,
                antagonist!.tank.equipment,
                antagonist!.equipmentMatrix,
              );
              const penetration =
                resolveNearPenetration(shell.penetration) *
                resolvePenetrationCoefficient(hasCalibratedShells, shell.type);
              const thicknessCoefficient = hasEnhancedArmor ? 1.03 : 1;
              const filteredIntersections = event.intersections.filter(
                (intersection) => 'type' in intersection.object.userData,
              ) as unknown as Intersection<
                Object3D & { userData: ArmorUserData }
              >[];
              const encounteredExternalModuleVariants: ExternalModuleVariant[] =
                [];
              const noDuplicateIntersections: typeof filteredIntersections = [];

              for (const intersection of filteredIntersections) {
                if (intersection.object.userData.type === ArmorType.External) {
                  if (
                    !encounteredExternalModuleVariants.includes(
                      intersection.object.userData.variant,
                    )
                  ) {
                    noDuplicateIntersections.push(intersection);
                    encounteredExternalModuleVariants.push(
                      intersection.object.userData.variant,
                    );
                  }
                } else {
                  noDuplicateIntersections.push(intersection);

                  if (intersection.object.userData.type === ArmorType.Core) {
                    break;
                  }
                }
              }

              let remainingPenetration = penetration;
              let index = 0;
              for (const intersection of noDuplicateIntersections) {
                const layer = intersection.object.userData;

                if (shell.type === ShellType.HEAT && index > 0) {
                  const lastLayer = shot.layersIn.at(-1) as ShotLayerBase;
                  const distance = lastLayer.point.distanceTo(
                    intersection.point,
                  );
                  remainingPenetration -= 0.5 * remainingPenetration * distance;
                  const blocked = remainingPenetration <= 0;

                  shot.layersIn.push({
                    type: null,
                    distance,
                    status: blocked ? 'blocked' : 'penetration',
                  });

                  if (blocked) break;
                }

                if (layer.type === ArmorType.External) {
                  const thickness = layer.thickness * thicknessCoefficient;
                  remainingPenetration -= thickness;
                  const blocked =
                    remainingPenetration <= 0 || shell.type === ShellType.HE;

                  shot.layersIn.push({
                    type: ArmorType.External,
                    index,
                    thickness,
                    point: intersection.point,
                    surfaceNormal: intersection.face!.normal,
                    status: blocked ? 'blocked' : 'penetration',
                  });
                } else {
                  const ricochet = degToRad(
                    isExplosive(shell.type) ? 90 : shell.ricochet!,
                  );
                  const surfaceNormal = intersection
                    .normal!.clone()
                    .applyQuaternion(
                      event.object.getWorldQuaternion(new Quaternion()),
                    );
                  const angle = surfaceNormal.angleTo(cameraNormal);
                  const threeCalibersRule =
                    shell.caliber > thickness * 3 || index > 0;
                  const twoCalibersRule = shell.caliber > thickness * 2;
                  const normalization = degToRad(shell.normalization ?? 0);
                  const finalNormalization = twoCalibersRule
                    ? (1.4 * normalization * shell.caliber) / (2.0 * thickness)
                    : normalization;
                  const finalThickness =
                    thickness /
                    Math.cos(Math.max(0, angle - finalNormalization));

                  if (!threeCalibersRule && angle >= ricochet) {
                    remainingPenetration *= 0.75;

                    shot.layersIn.push({
                      type: layer.type,
                      index,
                      thickness,
                      thicknessAngled: finalThickness,
                      point: intersection.point,
                      surfaceNormal: intersection.face!.normal,
                      status: 'ricochet',
                      angle,
                    });

                    break;
                  } else {
                    remainingPenetration -= finalThickness;
                    const blocked = remainingPenetration <= 0;

                    shot.layersIn.push({
                      type: layer.type,
                      index,
                      thickness,
                      thicknessAngled: finalThickness,
                      point: intersection.point,
                      surfaceNormal: intersection.face!.normal,
                      status: blocked ? 'blocked' : 'penetration',
                      angle,
                    });
                  }
                }

                if (shell.type !== ShellType.HE && remainingPenetration <= 0) {
                  break;
                }

                index++;
              }

              const lastLayer = shot.layersIn.at(-1) as ShotLayerBase;
              const firstLayer = shot.layersIn[0] as ShotLayerBase;

              if (shell.type === ShellType.HE) {
                const totalThickness = shot.layersIn.reduce((acc, layer) => {
                  if (layer.type === null) return acc;

                  if (layer.type === ArmorType.External) {
                    return acc + layer.thickness;
                  }

                  return acc + layer.thicknessAngled;
                }, 0);
                const distanceFromSpacedArmor = firstLayer.point.distanceTo(
                  lastLayer.point,
                );
                const finalDamage = Math.max(
                  0,
                  0.5 *
                    shell.damage.armor *
                    (1 - distanceFromSpacedArmor / shell.explosionRadius!) -
                    1.1 * totalThickness,
                );

                if (
                  shot.layersIn.length > 1 ||
                  lastLayer.status === 'blocked'
                ) {
                  console.log(finalDamage);

                  shot.status = finalDamage > 0 ? 'splash' : 'blocked';
                  shot.damage = finalDamage;
                } else {
                  shot.status = 'penetration';
                  shot.damage = shell.damage.armor;
                }
              } else {
                if (lastLayer.status === 'blocked') {
                  shot.status = 'blocked';
                  shot.damage = 0;
                } else if (lastLayer.status === 'penetration') {
                  shot.status = 'penetration';
                  shot.damage = shell.damage.armor;
                } else {
                  // check second array for result
                  shot.status = 'ricochet';
                }
              }

              console.log(shot);
              useTankopediaTemporary.setState({ shot });

              // const duel = useDuel.getState();
              // const hasCalibratedShells = await hasEquipment(
              //   103,
              //   duel.antagonist!.tank.equipment,
              //   duel.antagonist!.equipmentMatrix,
              // );
              // const hasEnhancedArmor = await hasEquipment(
              //   110,
              //   duel.protagonist!.tank.equipment,
              //   duel.protagonist!.equipmentMatrix,
              // );
              // const thicknessCoefficient = hasEnhancedArmor ? 1.03 : 1;
              // const shell = useDuel.getState().antagonist!.shell;
              // const explosive = isExplosive(shell.type);
              // const splashing = canSplash(shell.type);
              // const penetration =
              //   resolveNearPenetration(shell.penetration) *
              //   (hasCalibratedShells
              //     ? duel.antagonist!.shell.type === 'ap'
              //       ? 1.08
              //       : duel.antagonist!.shell.type === 'ap_cr'
              //         ? 1.05
              //         : duel.antagonist!.shell.type === 'hc'
              //           ? 1.13
              //           : 1.08
              //     : 1);
              // const shot: Shot = {
              //   layers: [],
              //   point: event.point,
              // }; // TODO: type this
              // let remainingPenetration = penetration;

              // const shellNormal = camera.position
              //   .clone()
              //   .sub(event.point)
              //   .normalize();

              // pushLogs(
              //   shellNormal,
              //   filterIntersections(event.intersections),
              //   0,
              // );

              // function filterIntersections(intersectionsRaw: Intersection[]) {
              //   const showSpacedArmor =
              //     useTankopediaPersistent.getState().model.visual
              //       .showSpacedArmor;
              //   const intersectionsTyped = intersectionsRaw.filter(
              //     ({ object }) => object.userData.type !== undefined,
              //   ) as ArmorMeshIntersection[];
              //   const intersectionsFiltered = intersectionsTyped.filter(
              //     ({ object }) =>
              //       showSpacedArmor
              //         ? true
              //         : object.userData.type === ArmorType.Core,
              //   );
              //   const intersectionsWithDuplicates = intersectionsFiltered.slice(
              //     0,
              //     intersectionsFiltered.findIndex(
              //       ({ object }) => object.userData.type === ArmorType.Core,
              //     ) + 1,
              //   );
              //   const firstGunIntersectionIndex =
              //     intersectionsWithDuplicates.findIndex(
              //       ({ object }) =>
              //         object.userData.type === ArmorType.External &&
              //         object.userData.variant === 'gun',
              //     );
              //   const firstTrackIntersectionIndex =
              //     intersectionsWithDuplicates.findIndex(
              //       ({ object }) =>
              //         object.userData.type === ArmorType.External &&
              //         object.userData.variant === 'track',
              //     );
              //   let intersections = intersectionsWithDuplicates;

              //   if (firstGunIntersectionIndex !== -1) {
              //     intersections = intersections.filter(({ object }, index) => {
              //       return object.userData.type === ArmorType.External &&
              //         object.userData.variant === 'gun'
              //         ? index === firstGunIntersectionIndex
              //         : true;
              //     });
              //   }
              //   if (firstTrackIntersectionIndex !== -1) {
              //     intersections = intersections.filter(({ object }, index) => {
              //       return object.userData.type === ArmorType.External &&
              //         object.userData.variant === 'track'
              //         ? index === firstTrackIntersectionIndex
              //         : true;
              //     });
              //   }

              //   return intersections;
              // }

              // function pushLogs(
              //   shellNormal: Vector3,
              //   intersections: ArmorMeshIntersection[],
              //   startingIndex: number,
              // ) {
              //   let layerIndex = startingIndex;
              //   let loopIndex = 0;

              //   if (layerIndex !== 0 && intersections.length > 0) {
              //     const distance = (
              //       shot.layers.at(-1) as ShotLayerBase
              //     ).point.distanceTo(intersections[0].point);
              //     if (shell.type === 'hc') {
              //       remainingPenetration -=
              //         0.5 * remainingPenetration * distance;
              //     }
              //     const blocked = remainingPenetration < 0;

              //     shot.layers.push({
              //       type: null,
              //       status: blocked ? 'blocked' : 'penetration',
              //       distance,
              //     });

              //     if (blocked) return;
              //   }

              //   for (const intersection of intersections) {
              //     const surfaceNormal = intersection
              //       .normal!.clone()
              //       .applyQuaternion(
              //         event.object.getWorldQuaternion(new Quaternion()),
              //       );
              //     const thickness =
              //       thicknessCoefficient *
              //       intersection.object.userData.thickness;

              //     if (layerIndex !== 0 && startingIndex === 0) {
              //       const previousIntersection = intersections[layerIndex - 1];
              //       const distance =
              //         intersection.distance - previousIntersection.distance;
              //       if (shell.type === 'hc') {
              //         remainingPenetration -=
              //           0.5 * remainingPenetration * distance;
              //       }
              //       const wasted = remainingPenetration < 0 || splashing;

              //       shot.layers.push({
              //         type: null,
              //         status: wasted ? 'blocked' : 'penetration',
              //         distance,
              //       });

              //       if (wasted && !splashing) return;
              //     }

              //     if (
              //       intersection.object.userData.type === ArmorType.External
              //     ) {
              //       remainingPenetration -= thickness;
              //       const blocked = remainingPenetration < 0;

              //       shot.layers.push({
              //         type: ArmorType.External,
              //         index: layerIndex,
              //         shellNormal,
              //         surfaceNormal,
              //         point: intersection.point,
              //         thickness: intersection.object.userData.thickness,
              //         status: blocked ? 'blocked' : 'penetration',
              //       });

              //       if (splashing) {
              //         remainingPenetration = Math.max(0, remainingPenetration);
              //       } else if (blocked) {
              //         break;
              //       }
              //     } else {
              //       const type = intersection.object.userData.type;
              //       const angle = surfaceNormal.angleTo(shellNormal);
              //       const ricochet = degToRad(
              //         isExplosive(shell.type) ? 90 : shell.ricochet!,
              //       );
              //       const normalization = degToRad(shell.normalization ?? 0);
              //       const threeCalibersRule =
              //         shell.caliber > thickness * 3 || layerIndex > 0;
              //       const twoCalibersRule = shell.caliber > thickness * 2;
              //       const finalNormalization = twoCalibersRule
              //         ? (1.4 * normalization * shell.caliber) /
              //           (2.0 * thickness)
              //         : normalization;
              //       const finalThickness =
              //         thickness === 0
              //           ? 0
              //           : thickness /
              //             Math.cos(Math.max(0, angle - finalNormalization));

              //       if (!threeCalibersRule && angle >= ricochet) {
              //         shot.layers.push({
              //           type,
              //           index: layerIndex,
              //           shellNormal,
              //           surfaceNormal,
              //           point: intersection.point,
              //           thickness,
              //           thicknessAngled: finalThickness,
              //           angle,
              //           status: 'ricochet',
              //         });

              //         remainingPenetration *= 0.75;

              //         const raycaster = new Raycaster();
              //         const newShellNormal = shellNormal
              //           .clone()
              //           .reflect(surfaceNormal);
              //         const newCameraNormal = newShellNormal
              //           .clone()
              //           .multiplyScalar(-1);

              //         raycaster.set(intersection.point, newCameraNormal);
              //         pushLogs(
              //           newShellNormal,
              //           filterIntersections(
              //             raycaster.intersectObjects(scene.children, true),
              //           ),
              //           layerIndex + 1,
              //         );

              //         break;
              //       } else {
              //         remainingPenetration -= finalThickness;
              //         const blocked = remainingPenetration < 0;

              //         shot.layers.push({
              //           type,
              //           index: layerIndex,
              //           shellNormal,
              //           surfaceNormal,
              //           point: intersection.point,
              //           thickness,
              //           thicknessAngled: finalThickness,
              //           angle,
              //           status: blocked ? 'blocked' : 'penetration',
              //         });
              //       }
              //     }

              //     layerIndex++;
              //     loopIndex++;
              //   }
              // }

              // useTankopediaTemporary.setState({ shot });
            },
          },
          node.uuid,
        )}

      {props.type === ArmorType.Spaced && (
        <SpacedArmorSubSpaced node={node} thickness={thickness} />
      )}

      {props.type === ArmorType.External && (
        <SpacedArmorSubExternal
          node={node}
          thickness={thickness}
          variant={props.variant}
          clip={clip}
        />
      )}
    </>
  );
}

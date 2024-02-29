import { useThree } from '@react-three/fiber';
import {
  Intersection,
  MeshBasicMaterial,
  Object3D,
  Quaternion,
  Raycaster,
  Scene,
  Vector3,
} from 'three';
import { degToRad } from 'three/src/math/MathUtils';
import { isExplosive } from '../../../../core/blitz/isExplosive';
import { resolveNearPenetration } from '../../../../core/blitz/resolveNearPenetration';
import { hasEquipment } from '../../../../core/blitzkrieg/hasEquipment';
import { jsxTree } from '../../../../core/blitzkrieg/jsxTree';
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
  ...props
}: SpacedArmorSceneComponentProps) {
  const camera = useThree((state) => state.camera);
  // const cameraNormal = new Vector3();

  return (
    <>
      {props.type === ArmorType.Core &&
        jsxTree(node, {
          renderOrder: 0,
          material: omitMaterial,
          userData: {
            type: ArmorType.Core,
            thickness,
          } satisfies ArmorUserData,

          async onClick(event) {
            event.stopPropagation();

            const hasCalibratedShells = await hasEquipment(103, true);
            const hasEnhancedArmor = await hasEquipment(110);
            const thicknessCoefficient = hasEnhancedArmor ? 1.04 : 1;
            const shell = useDuel.getState().antagonist!.shell;
            const penetration =
              resolveNearPenetration(shell.penetration) *
              (hasCalibratedShells
                ? isExplosive(shell.type)
                  ? 1.1
                  : 1.05
                : 1);
            const shot: Shot = []; // TODO: type this
            let remainingPenetration = penetration;
            let penetrationChance = -1;
            let splashChance = -1;

            const shellNormal = camera.position
              .clone()
              .sub(event.point)
              .normalize();
            const cameraNormal = shellNormal.clone().multiplyScalar(-1);

            pushLogs(
              shellNormal,
              cameraNormal,
              filterIntersections(event.intersections),
              0,
            );

            // console.clear();
            // console.log(
            //   JSON.stringify(
            //     shot.map((i) => ({
            //       ...i,
            //       ...(i.angle ? { angle: radToDeg(i.angle) } : {}),
            //     })),
            //     null,
            //     2,
            //   ),
            // );

            function filterIntersections(intersectionsRaw: Intersection[]) {
              const intersectionsAll = intersectionsRaw.filter(
                ({ object }) => object.userData.type !== undefined,
              ) as ArmorMeshIntersection[];
              const intersectionsWithDuplicates = intersectionsAll.slice(
                0,
                intersectionsAll.findIndex(
                  ({ object }) => object.userData.type === ArmorType.Core,
                ) + 1,
              );
              const firstGunIntersectionIndex =
                intersectionsWithDuplicates.findIndex(
                  ({ object }) =>
                    object.userData.type === ArmorType.External &&
                    object.userData.variant === 'gun',
                );
              const firstTrackIntersectionIndex =
                intersectionsWithDuplicates.findIndex(
                  ({ object }) =>
                    object.userData.type === ArmorType.External &&
                    object.userData.variant === 'track',
                );
              let intersections = intersectionsWithDuplicates;

              if (firstGunIntersectionIndex !== -1) {
                intersections = intersections.filter(({ object }, index) => {
                  return object.userData.type === ArmorType.External &&
                    object.userData.variant === 'gun'
                    ? index === firstGunIntersectionIndex
                    : true;
                });
              }
              if (firstTrackIntersectionIndex !== -1) {
                intersections = intersections.filter(({ object }, index) => {
                  return object.userData.type === ArmorType.External &&
                    object.userData.variant === 'track'
                    ? index === firstTrackIntersectionIndex
                    : true;
                });
              }

              console.log(
                JSON.stringify(
                  intersections.map((i) => i.object.userData),
                  null,
                  2,
                ),
              );

              return intersections;
            }

            function pushLogs(
              shellNormal: Vector3,
              cameraNormal: Vector3,
              intersections: ArmorMeshIntersection[],
              startingIndex: number,
            ) {
              let layerIndex = startingIndex;
              let loopIndex = 0;

              if (layerIndex !== 0) {
                shot.push({
                  type: null,
                  distance: (shot.at(-1) as ShotLayerBase).point.distanceTo(
                    intersections[0].point,
                  ),
                });
              }

              for (const intersection of intersections) {
                const surfaceNormal = intersection
                  .normal!.clone()
                  .applyQuaternion(
                    event.object.getWorldQuaternion(new Quaternion()),
                  );
                const thickness =
                  thicknessCoefficient * intersection.object.userData.thickness;

                if (layerIndex !== 0 && startingIndex === 0) {
                  const previousIntersection = intersections[layerIndex - 1];
                  shot.push({
                    type: null,
                    distance:
                      intersection.distance - previousIntersection.distance,
                  });
                }

                if (intersection.object.userData.type === ArmorType.External) {
                  remainingPenetration -= thickness;
                  const blocked = remainingPenetration < 0;

                  shot.push({
                    type: ArmorType.External,
                    index: layerIndex,
                    shellNormal,
                    surfaceNormal,
                    point: intersection.point,
                    thickness: intersection.object.userData.thickness,
                    status: blocked ? 'blocked' : 'penetration',
                  });

                  if (blocked) break;
                } else {
                  const type = intersection.object.userData.type;
                  const angle = surfaceNormal.angleTo(shellNormal);
                  const ricochet = degToRad(shell.ricochet ?? 90);
                  const normalization = degToRad(shell.normalization ?? 0);
                  const threeCalibersRule =
                    shell.caliber > thickness * 3 || layerIndex > 0;
                  const twoCalibersRule = shell.caliber > thickness * 2;
                  const finalNormalization = twoCalibersRule
                    ? (1.4 * normalization * shell.caliber) / (2.0 * thickness)
                    : normalization;
                  const finalThickness =
                    thickness / Math.cos(angle - finalNormalization);
                  remainingPenetration -= finalThickness;

                  if (!threeCalibersRule && angle >= ricochet) {
                    shot.push({
                      type,
                      index: layerIndex,
                      shellNormal,
                      surfaceNormal,
                      point: intersection.point,
                      thickness,
                      thicknessAngled: finalThickness,
                      angle,
                      status: 'ricochet',
                    });

                    const raycaster = new Raycaster();
                    const newShellNormal = shellNormal
                      .clone()
                      .reflect(surfaceNormal);
                    const newCameraNormal = newShellNormal
                      .clone()
                      .multiplyScalar(-1);

                    raycaster.set(intersection.point, newCameraNormal);
                    pushLogs(
                      newShellNormal,
                      newCameraNormal,
                      filterIntersections(
                        raycaster.intersectObjects(scene.children, true),
                      ),
                      layerIndex + 1,
                    );

                    break;
                  } else {
                    const blocked = remainingPenetration < 0;
                    shot.push({
                      type,
                      index: layerIndex,
                      shellNormal,
                      surfaceNormal,
                      point: intersection.point,
                      thickness,
                      thicknessAngled: finalThickness,
                      angle,
                      status: blocked ? 'blocked' : 'penetration',
                    });
                  }
                }

                layerIndex++;
                loopIndex++;
              }
            }

            useTankopediaTemporary.setState({ shot });
          },
        })}

      {props.type === ArmorType.Spaced && (
        <SpacedArmorSubSpaced node={node} thickness={thickness} />
      )}

      {props.type === ArmorType.External && (
        <SpacedArmorSubExternal
          node={node}
          thickness={thickness}
          variant={props.variant}
        />
      )}
    </>
  );
}

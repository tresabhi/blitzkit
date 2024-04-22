import { useThree } from '@react-three/fiber';
import {
  Intersection,
  MeshBasicMaterial,
  Object3D,
  Plane,
  Quaternion,
  Raycaster,
  Scene,
  Vector3,
} from 'three';
import { degToRad } from 'three/src/math/MathUtils';
import { canSplash } from '../../../../core/blitz/canSplash';
import { isExplosive } from '../../../../core/blitz/isExplosive';
import { resolveNearPenetration } from '../../../../core/blitz/resolveNearPenetration';
import { hasEquipment } from '../../../../core/blitzrinth/hasEquipment';
import { jsxTree } from '../../../../core/blitzrinth/jsxTree';
import { useDuel } from '../../../../stores/duel';
import {
  Shot,
  ShotLayerBase,
  useTankopediaPersistent,
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

              const duel = useDuel.getState();
              const hasCalibratedShells = await hasEquipment(
                103,
                duel.antagonist!.tank.equipment,
                duel.antagonist!.equipmentMatrix,
              );
              const hasEnhancedArmor = await hasEquipment(
                110,
                duel.protagonist!.tank.equipment,
                duel.protagonist!.equipmentMatrix,
              );
              const thicknessCoefficient = hasEnhancedArmor ? 1.04 : 1;
              const shell = useDuel.getState().antagonist!.shell;
              const explosive = isExplosive(shell.type);
              const splashing = canSplash(shell.type);
              const penetration =
                resolveNearPenetration(shell.penetration) *
                (hasCalibratedShells
                  ? isExplosive(shell.type)
                    ? 1.1
                    : 1.05
                  : 1);
              const shot: Shot = {
                layers: [],
                point: event.point,
              }; // TODO: type this
              let remainingPenetration = penetration;

              const shellNormal = camera.position
                .clone()
                .sub(event.point)
                .normalize();

              pushLogs(
                shellNormal,
                filterIntersections(event.intersections),
                0,
              );

              function filterIntersections(intersectionsRaw: Intersection[]) {
                const showSpacedArmor =
                  useTankopediaPersistent.getState().model.visual
                    .showSpacedArmor;
                const intersectionsTyped = intersectionsRaw.filter(
                  ({ object }) => object.userData.type !== undefined,
                ) as ArmorMeshIntersection[];
                const intersectionsFiltered = intersectionsTyped.filter(
                  ({ object }) =>
                    showSpacedArmor
                      ? true
                      : object.userData.type === ArmorType.Core,
                );
                const intersectionsWithDuplicates = intersectionsFiltered.slice(
                  0,
                  intersectionsFiltered.findIndex(
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

                return intersections;
              }

              function pushLogs(
                shellNormal: Vector3,
                intersections: ArmorMeshIntersection[],
                startingIndex: number,
              ) {
                let layerIndex = startingIndex;
                let loopIndex = 0;

                if (layerIndex !== 0 && intersections.length > 0) {
                  const distance = (
                    shot.layers.at(-1) as ShotLayerBase
                  ).point.distanceTo(intersections[0].point);
                  if (explosive && !splashing)
                    remainingPenetration -=
                      0.5 * remainingPenetration * distance;
                  const blocked = remainingPenetration < 0;

                  shot.layers.push({
                    type: null,
                    status: blocked ? 'blocked' : 'penetration',
                    distance,
                  });

                  if (blocked) return;
                }

                for (const intersection of intersections) {
                  const surfaceNormal = intersection
                    .normal!.clone()
                    .applyQuaternion(
                      event.object.getWorldQuaternion(new Quaternion()),
                    );
                  const thickness =
                    thicknessCoefficient *
                    intersection.object.userData.thickness;

                  if (layerIndex !== 0 && startingIndex === 0) {
                    const previousIntersection = intersections[layerIndex - 1];
                    const distance =
                      intersection.distance - previousIntersection.distance;
                    if (explosive && !splashing)
                      remainingPenetration -=
                        0.5 * remainingPenetration * distance;
                    const wasted = remainingPenetration < 0;

                    shot.layers.push({
                      type: null,
                      status: wasted ? 'blocked' : 'penetration',
                      distance,
                    });

                    if (wasted && !splashing) return;
                  }

                  if (
                    intersection.object.userData.type === ArmorType.External
                  ) {
                    remainingPenetration -= thickness;
                    const blocked = remainingPenetration < 0;

                    shot.layers.push({
                      type: ArmorType.External,
                      index: layerIndex,
                      shellNormal,
                      surfaceNormal,
                      point: intersection.point,
                      thickness: intersection.object.userData.thickness,
                      status: blocked ? 'blocked' : 'penetration',
                    });

                    if (splashing) {
                      remainingPenetration = Math.max(0, remainingPenetration);
                    } else if (blocked) {
                      break;
                    }
                  } else {
                    const type = intersection.object.userData.type;
                    const angle = surfaceNormal.angleTo(shellNormal);
                    const ricochet = degToRad(shell.ricochet ?? 90);
                    const normalization = degToRad(shell.normalization ?? 0);
                    const threeCalibersRule =
                      shell.caliber > thickness * 3 || layerIndex > 0;
                    const twoCalibersRule = shell.caliber > thickness * 2;
                    const finalNormalization = twoCalibersRule
                      ? (1.4 * normalization * shell.caliber) /
                        (2.0 * thickness)
                      : normalization;
                    const finalThickness =
                      thickness === 0
                        ? 0
                        : thickness /
                          Math.cos(Math.max(0, angle - finalNormalization));

                    if (!threeCalibersRule && angle >= ricochet) {
                      shot.layers.push({
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

                      remainingPenetration *= 0.75;

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
                        filterIntersections(
                          raycaster.intersectObjects(scene.children, true),
                        ),
                        layerIndex + 1,
                      );

                      break;
                    } else {
                      remainingPenetration -= finalThickness;
                      const blocked = remainingPenetration < 0;

                      shot.layers.push({
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

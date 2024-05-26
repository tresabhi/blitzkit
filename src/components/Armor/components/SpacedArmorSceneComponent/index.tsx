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
  ShotLayerNonExternal,
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

              const { antagonist, protagonist } = useDuel.getState();
              const shell = antagonist!.shell;
              const cameraNormal = camera.position
                .clone()
                .sub(event.point)
                .normalize();
              const shot: Shot = {
                damage: -1,
                containsGaps: shell.type === ShellType.HEAT,
                in: {
                  cameraNormal,
                  layers: [],
                  status: 'blocked',
                },
                point: event.point,
              };

              const hasCalibratedShells = await hasEquipment(
                103,
                antagonist!.tank.equipment,
                antagonist!.equipmentMatrix,
              );
              const hasEnhancedArmor = await hasEquipment(
                110,
                protagonist!.tank.equipment,
                protagonist!.equipmentMatrix,
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
                  const lastLayer = shot.in.layers.at(-1) as ShotLayerBase;
                  const distance = lastLayer.point.distanceTo(
                    intersection.point,
                  );
                  remainingPenetration -= 0.5 * remainingPenetration * distance;
                  const blocked = remainingPenetration <= 0;

                  shot.in.layers.push({
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

                  shot.in.layers.push({
                    type: ArmorType.External,
                    index,
                    thickness,
                    point: intersection.point,
                    surfaceNormal: intersection.face!.normal,
                    status: blocked ? 'blocked' : 'penetration',
                    variant: layer.variant,
                  });
                } else {
                  const thickness = layer.thickness;
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

                    shot.in.layers.push({
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

                    shot.in.layers.push({
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

              const lastLayer = shot.in.layers.at(-1) as ShotLayerNonExternal;
              const firstLayer = shot.in.layers[0] as ShotLayerBase;

              if (shell.type === ShellType.HE) {
                const totalSpacedArmorThickness = shot.in.layers.reduce(
                  (acc, layer) => {
                    if (layer.type === null || layer.type === ArmorType.Core) {
                      return acc;
                    }

                    if (layer.type === ArmorType.External) {
                      return acc + layer.thickness;
                    }

                    return acc + layer.thicknessAngled;
                  },
                  0,
                );
                const distanceFromSpacedArmor = firstLayer.point.distanceTo(
                  lastLayer.point,
                );
                const finalDamage = Math.max(
                  0,
                  0.5 *
                    shell.damage.armor *
                    (1 - distanceFromSpacedArmor / shell.explosionRadius!) -
                    1.1 *
                      (lastLayer.thicknessAngled +
                        Math.min(penetration, totalSpacedArmorThickness)),
                );

                /**
                 * Above is some peculiar math. We're multiplying 1.1 by the
                 * thickness of the core plate plus the total spaced armor
                 * thickness capped to the penetration itself. This is because
                 * the shader is normalized by the penetration value; hence,
                 * the total spaced armor thickness cannot ever be thicker
                 * than the penetration. This is a precision error on the
                 * shader-side and I do not intend on fixing it. Instead,
                 * for parity's sake, I am capping the value here.
                 */

                if (
                  shot.in.layers.length > 1 ||
                  lastLayer.status === 'blocked'
                ) {
                  shot.in.status = finalDamage > 0 ? 'splash' : 'blocked';
                  shot.damage = finalDamage;
                } else {
                  shot.in.status = 'penetration';
                  shot.damage = shell.damage.armor;
                }
              } else {
                if (lastLayer.status === 'blocked') {
                  shot.in.status = 'blocked';
                  shot.damage = 0;
                } else if (lastLayer.status === 'penetration') {
                  shot.in.status = 'penetration';
                  shot.damage = shell.damage.armor;
                } else {
                  // check second array for result
                  shot.in.status = 'ricochet';
                }
              }

              console.log(shot);
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

import { ThreeEvent, useThree } from '@react-three/fiber';
import { clamp } from 'lodash';
import { useCallback } from 'react';
import {
  Intersection,
  MeshBasicMaterial,
  MeshStandardMaterial,
  NormalBlending,
  Object3D,
  Plane,
  Quaternion,
  Raycaster,
  Scene,
  Vector3,
} from 'three';
import { degToRad } from 'three/src/math/MathUtils';
import { isExplosive } from '../../../../core/blitz/isExplosive';
import { resolveNearPenetration } from '../../../../core/blitz/resolveNearPenetration';
import { resolvePenetrationCoefficient } from '../../../../core/blitz/resolvePenetrationCoefficient';
import { hasEquipment } from '../../../../core/blitzkit/hasEquipment';
import { jsxTree } from '../../../../core/blitzkit/jsxTree';
import { ShellType } from '../../../../core/blitzkit/tankDefinitions';
import * as Duel from '../../../../stores/duel';
import * as TankopediaEphemeral from '../../../../stores/tankopediaEphemeral';
import { ThicknessRange } from '../../../StaticArmor/components/StaticArmorScene';
import { ArmorType } from '../SpacedArmorScene';
import { SpacedArmorSubExternal } from './components/SpacedArmorSubExternal';
import { SpacedArmorSubSpaced } from './components/SpacedArmorSubSpaced';

function to255(value: number) {
  return Math.round(255 * value);
}

type SpacedArmorSceneComponentProps = {
  static?: boolean;
  node: Object3D;
  thickness: number;
  scene: Scene;
  clip?: Plane;
  thicknessRange: ThicknessRange;
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
  static: staticMode,
  thicknessRange,
  ...props
}: SpacedArmorSceneComponentProps) {
  const tankopediaEphemeralStore = TankopediaEphemeral.useStore();
  const camera = useThree((state) => state.camera);
  const duelStore = Duel.useStore();

  const shoot = useCallback(
    async (
      point: Vector3,
      intersections: Intersection[],
      allowRicochet: boolean,
      remainingPenetrationInput?: number,
    ) => {
      const { antagonist, protagonist } = duelStore.getState();
      const shell = antagonist.shell;
      const cameraNormal = camera.position.clone().sub(point).normalize();
      const shot: TankopediaEphemeral.Shot = {
        splashRadius: shell.explosionRadius,
        damage: -1,
        containsGaps: shell.type === ShellType.HEAT,
        in: {
          surfaceNormal: cameraNormal,
          layers: [],
          status: 'blocked',
        },
      };

      const hasCalibratedShells = await hasEquipment(
        103,
        antagonist.tank.equipment,
        antagonist.equipmentMatrix,
      );
      const hasEnhancedArmor = await hasEquipment(
        110,
        protagonist.tank.equipment,
        protagonist.equipmentMatrix,
      );
      const penetration =
        resolveNearPenetration(shell.penetration) *
        resolvePenetrationCoefficient(hasCalibratedShells, shell.type);
      const thicknessCoefficient = hasEnhancedArmor ? 1.03 : 1;
      const filteredIntersections = intersections.filter(
        (intersection) => 'type' in intersection.object.userData,
      ) as unknown as Intersection<Object3D & { userData: ArmorUserData }>[];
      const encounteredExternalModuleVariants: ExternalModuleVariant[] = [];
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

      let remainingPenetration = remainingPenetrationInput ?? penetration;
      let index = 0;
      for (const intersection of noDuplicateIntersections) {
        const layer = intersection.object.userData;
        const surfaceNormal = intersection
          .normal!.clone()
          .applyQuaternion(
            intersection.object.getWorldQuaternion(new Quaternion()),
          );

        if (shell.type === ShellType.HEAT && index > 0) {
          const lastLayer = shot.in.layers.at(
            -1,
          ) as TankopediaEphemeral.ShotLayerBase;
          const distance = lastLayer.point.distanceTo(intersection.point);
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
            surfaceNormal,
            status:
              shell.type === ShellType.HE
                ? 'blocked'
                : blocked
                  ? 'blocked'
                  : 'penetration',
            variant: layer.variant,
          });
        } else {
          const thickness = layer.thickness;
          const ricochet = degToRad(
            isExplosive(shell.type) ? 90 : shell.ricochet!,
          );
          const angle = surfaceNormal.angleTo(cameraNormal);

          const threeCalibersRule =
            shell.caliber > thickness * 3 || index > 0 || !allowRicochet;
          const twoCalibersRule = shell.caliber > thickness * 2;
          const normalization = degToRad(shell.normalization ?? 0);
          const finalNormalization = twoCalibersRule
            ? (1.4 * normalization * shell.caliber) / (2.0 * thickness)
            : normalization;
          const finalThickness =
            thickness / Math.cos(Math.max(0, angle - finalNormalization));

          if (!threeCalibersRule && angle >= ricochet) {
            remainingPenetration *= 0.75;

            shot.in.layers.push({
              type: layer.type,
              index,
              thickness,
              thicknessAngled: finalThickness,
              point: intersection.point,
              surfaceNormal,
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
              status:
                shell.type === ShellType.HE && layer.type !== ArmorType.Core
                  ? 'blocked'
                  : blocked
                    ? 'blocked'
                    : 'penetration',
              angle,
            });
          }
        }

        if (shell.type !== ShellType.HE && remainingPenetration <= 0) {
          break;
        }

        index++;
      }

      const lastLayer = shot.in.layers.at(-1) as
        | TankopediaEphemeral.ShotLayerNonExternal
        | undefined;
      const firstLayer = shot.in.layers[0] as
        | TankopediaEphemeral.ShotLayerBase
        | undefined;

      if (!lastLayer || !firstLayer) {
        return null;
      } else {
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

          if (shot.in.layers.length > 1 || lastLayer.status === 'blocked') {
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
            const caster = new Raycaster();
            // https://math.stackexchange.com/a/13263/1222875
            const shellNormal = cameraNormal.clone().multiplyScalar(-1);
            const ricochetNormal = shellNormal
              .clone()
              .sub(
                lastLayer.surfaceNormal
                  .clone()
                  .multiplyScalar(2 * shellNormal.dot(lastLayer.surfaceNormal)),
              );

            caster.set(lastLayer.point, ricochetNormal);

            const ricochetIntersections = caster.intersectObjects(
              scene.children,
              true,
            );
            const outShot = await shoot(
              lastLayer.point,
              ricochetIntersections,
              false,
              remainingPenetration,
            );

            shot.in.status = 'ricochet';
            if (outShot === null) {
              shot.damage = 0;
              shot.out = {
                surfaceNormal: ricochetNormal,
                layers: [],
                status: 'ricochet',
              };
            } else {
              shot.damage = outShot.damage;
              shot.out = outShot.in;
              shot.out.surfaceNormal = ricochetNormal;
            }
          }
        }
      }

      return shot;
    },
    [camera],
  );

  const onClick = useCallback(
    async (event: ThreeEvent<MouseEvent>) => {
      event.stopPropagation();
      const shot = (await shoot(event.point, event.intersections, true))!;
      tankopediaEphemeralStore.setState({ shot });
    },
    [camera],
  );

  if (staticMode) {
    const x = clamp(thickness / thicknessRange.max, 0, 1);
    const r = -((1 - x) ** 2) + 1;
    const g = -(x ** 2) + 1;

    return jsxTree(node, {
      material: new MeshStandardMaterial({
        color:
          props.type === ArmorType.Core
            ? `rgb(${to255(r)}, ${to255(g)}, 0)`
            : props.type === ArmorType.Spaced
              ? `rgb(${to255(1 - x)}, 0, ${to255(1 - 0.75 * x)})`
              : `rgb(0, 255, 255)`,
        opacity:
          props.type === ArmorType.External
            ? 1 / 8
            : props.type === ArmorType.Spaced
              ? 7 / 8
              : 1,
        transparent: props.type !== ArmorType.Core,
        blending:
          props.type === ArmorType.Core ? NormalBlending : NormalBlending,
      }),

      userData: {
        type: props.type,
        variant: props.type === ArmorType.External ? props.variant : 'gun',
        thickness,
      } satisfies ArmorUserData,
      onClick: props.type === ArmorType.Core ? onClick : () => {},
    });
  }

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
            onClick,
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

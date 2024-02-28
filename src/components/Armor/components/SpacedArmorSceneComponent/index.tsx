import { useThree } from '@react-three/fiber';
import { Intersection, MeshBasicMaterial, Object3D, Vector3 } from 'three';
import { degToRad } from 'three/src/math/MathUtils';
import { I_HAT } from '../../../../constants/axis';
import { isExplosive } from '../../../../core/blitz/isExplosive';
import { resolveNearPenetration } from '../../../../core/blitz/resolveNearPenetration';
import { hasEquipment } from '../../../../core/blitzkrieg/hasEquipment';
import { jsxTree } from '../../../../core/blitzkrieg/jsxTree';
import { useDuel } from '../../../../stores/duel';
import { ArmorType } from '../SpacedArmorScene';
import { SpacedArmorSubExternal } from './components/SpacedArmorSubExternal';
import { SpacedArmorSubSpaced } from './components/SpacedArmorSubSpaced';

type SpacedArmorSceneComponentProps = {
  node: Object3D;
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

export type ExternalModuleVariant = 'gun' | 'track';
export type ArmorUserData = {
  thickness: number;
} & (
  | {
      type: 'core' | 'spaced';
    }
  | {
      type: 'external';
      variant: ExternalModuleVariant;
    }
);
type ArmorMeshIntersection = Intersection & {
  eventObject: Object3D;
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
  ...props
}: SpacedArmorSceneComponentProps) {
  const camera = useThree((state) => state.camera);
  const cameraNormal = new Vector3();

  return (
    <>
      {props.type === ArmorType.Core &&
        jsxTree(node, {
          renderOrder: 0,
          material: omitMaterial,
          userData: {
            type: 'core',
            thickness,
          } satisfies ArmorUserData,

          async onClick(event) {
            event.stopPropagation();

            const intersectionsAll = event.intersections.filter(
              ({ object }) => object.userData.type !== undefined,
            ) as ArmorMeshIntersection[];
            const intersectionsWithDuplicates = intersectionsAll.slice(
              0,
              intersectionsAll.findIndex(
                ({ object }) => object.userData.type === 'core',
              ),
            );
            const firstGunIntersectionIndex =
              intersectionsWithDuplicates.findIndex(
                ({ object }) =>
                  object.userData.type === 'external' &&
                  object.userData.variant === 'gun',
              );
            const firstTrackIntersectionIndex =
              intersectionsWithDuplicates.findIndex(
                ({ object }) =>
                  object.userData.type === 'external' &&
                  object.userData.variant === 'track',
              );
            let intersections = intersectionsWithDuplicates;

            if (firstGunIntersectionIndex !== -1) {
              intersections = intersections.filter(({ object }, index) => {
                return object.userData.type === 'external' &&
                  object.userData.variant === 'gun'
                  ? index === firstGunIntersectionIndex
                  : true;
              });
            }
            if (firstTrackIntersectionIndex !== -1) {
              intersections = intersections.filter(({ object }, index) => {
                return object.userData.type === 'external' &&
                  object.userData.variant === 'track'
                  ? index === firstTrackIntersectionIndex
                  : true;
              });
            }

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
            const shotLog: ({
              thickness: number;
              status: 'blocked' | 'penetration' | 'ricochet';
            } & (
              | {
                  type: ArmorType.External;
                }
              | {
                  type: Exclude<ArmorType, ArmorType.External>;
                  thicknessAngled: number;
                }
            ))[] = []; // TODO: type this
            let remainingPenetration = penetration;
            let penetrationChance = -1;
            let splashChance = -1;

            camera.getWorldDirection(cameraNormal).multiplyScalar(-1);

            let index = 0;
            for (const intersection of intersections) {
              const thickness =
                thicknessCoefficient * intersection.object.userData.thickness;

              if (intersection.object.userData.type === 'external') {
                remainingPenetration -= thickness;
                const blocked = remainingPenetration < 0;

                shotLog.push({
                  type: ArmorType.External,
                  thickness: intersection.object.userData.thickness,
                  status: blocked ? 'blocked' : 'penetration',
                });

                if (blocked) break;
              } else if (intersection.object.userData.type === 'spaced') {
                const normal = intersection.normal!.applyAxisAngle(
                  I_HAT,
                  -Math.PI / 2,
                );
                const angle = normal.angleTo(cameraNormal);
                const ricochet = degToRad(shell.ricochet ?? 90);
                const normalization = degToRad(shell.normalization ?? 0);
                const threeCalibersRule =
                  shell.caliber > thickness || index > 0;
                const twoCalibersRule = shell.caliber > thickness * 2;
                const finalNormalization = twoCalibersRule
                  ? (1.4 * normalization * shell.caliber) / (2.0 * thickness)
                  : normalization;
                const finalThickness =
                  thickness / Math.cos(angle - finalNormalization);
                remainingPenetration -= finalThickness;

                if (!threeCalibersRule && angle >= ricochet) {
                  shotLog.push({
                    type: ArmorType.Spaced,
                    thickness,
                    thicknessAngled: finalThickness,
                    status: 'ricochet',
                  });
                  continue;
                }
              } else throw new Error('Core should be omitted');

              index++;
            }

            console.log(JSON.stringify(shotLog, null, 2));
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

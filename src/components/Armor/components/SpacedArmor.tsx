import { AdditiveBlending, Color, MeshBasicMaterial, Object3D } from 'three';
import { ArmorType } from '../../../app/tools/tankopedia/[id]/components/Model/components/TankArmor/components/Spaced';
import { resolveNearPenetration } from '../../../core/blitz/resolveNearPenetration';
import { jsxTree } from '../../../core/blitzkrieg/jsxTree';
import { useDuel } from '../../../stores/duel';

interface SpacedArmorProps {
  node: Object3D;
  ornamental?: boolean;
  type: ArmorType;
  thickness: number;
}

const omitColor = new Color(0, 0, 0);

export function SpacedArmor({ node, type, thickness }: SpacedArmorProps) {
  const penetrationRaw = useDuel(
    (state) => state.antagonist!.shell.penetration,
  );
  const penetration = resolveNearPenetration(penetrationRaw);

  return (
    <>
      {type === ArmorType.External &&
        jsxTree(node, {
          renderOrder: 0,

          material: new MeshBasicMaterial({
            colorWrite: false,
          }),
        })}

      {jsxTree(node, {
        renderOrder: 1,

        material: new MeshBasicMaterial({
          color:
            type === ArmorType.Core
              ? omitColor
              : type === ArmorType.Spaced
                ? new Color(0, 0, 0)
                : new Color(thickness / penetration, 0, 0),
          depthWrite: type === ArmorType.Core,
          blending: type === ArmorType.Core ? undefined : AdditiveBlending,
        }),
      })}
    </>
  );
}

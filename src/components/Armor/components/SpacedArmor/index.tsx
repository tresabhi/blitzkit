import { MeshBasicMaterial, Object3D } from 'three';
import { jsxTree } from '../../../../core/blitzkrieg/jsxTree';
import { ArmorType } from '../SpacedArmorScene';
import { SpacedArmorSubExternal } from './components/SpacedArmorSubExternal';
import { SpacedArmorSubSpaced } from './components/SpacedArmorSubSpaced';
interface SpacedArmorProps {
  node: Object3D;
  ornamental?: boolean;
  type: ArmorType;
  thickness: number;
}

const omitMaterial = new MeshBasicMaterial({
  colorWrite: false,
  depthWrite: true,
});

export function SpacedArmor({ node, type, thickness }: SpacedArmorProps) {
  /**
   * Render orders allocations:
   * - 0  : core omission
   * - 1-2: spaced without depth buffer write but do test to allow additive blending
   * - 3-4: external with depth buffer write in first pass and read in second to simplify geometry
   * - 5  : spaced depth write
   */

  return (
    <>
      {type === ArmorType.Core &&
        jsxTree(node, {
          renderOrder: 0,
          material: omitMaterial,
        })}

      {type === ArmorType.Spaced && (
        <SpacedArmorSubSpaced node={node} thickness={thickness} />
      )}

      {type === ArmorType.External && (
        <SpacedArmorSubExternal node={node} thickness={thickness} />
      )}
    </>
  );
}

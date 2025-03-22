import { asset } from '@blitzkit/core';
import { useGLTF } from '@react-three/drei';
import {
  Color,
  LineBasicMaterial,
  Material,
  MeshStandardMaterial,
} from 'three';
import { clamp } from 'three/src/math/MathUtils.js';
import { jsxTree } from '../../../core/blitzkit/jsxTree';
import { Duel } from '../../../stores/duel';
import { TankopediaEphemeral } from '../../../stores/tankopediaEphemeral';
import { TankopediaPersistent } from '../../../stores/tankopediaPersistent';

interface StaticArmorSceneComponentsProp {
  group: string;
}

const moduleColor = new Color(192 / 255, 192 / 255, 192 / 255);
export const groupNameRegex = /([a-z]+)(_\d+)?/;

export function StaticArmorSceneComponent({
  group,
}: StaticArmorSceneComponentsProp) {
  const tank = Duel.use((state) => state.protagonist.tank);
  const showModules = TankopediaPersistent.use((state) => state.showModules);
  const showArmorScreen = TankopediaPersistent.use(
    (state) => state.showArmorScreen,
  );
  const showArmor = TankopediaPersistent.use((state) => state.showArmor);
  const gltf = useGLTF(asset(`tanks/${tank.id}/collision/${group}.glb`));
  const armor = TankopediaEphemeral.use((state) => state.armor);
  const groupName = group.match(groupNameRegex)![1];
  const groupArmor = armor.groups[groupName];
  const thicknessRange = TankopediaEphemeral.use(
    (state) => state.thicknessRange,
  );

  return jsxTree(gltf.scene, {
    mesh(mesh, props) {
      if (!(mesh.material instanceof Material)) {
        return null;
      }

      const armorName = mesh.material.name;
      const armorPlate = groupArmor.armors[armorName];
      const x = armorPlate.thickness / thicknessRange;
      const xClamped = clamp(x, 0, 1);
      const material = new MeshStandardMaterial();

      switch (armorPlate.type) {
        case 'Armor':
          if (!showArmor) return null;

          if (x > 1) {
            material.color = new Color(clamp(2 - x, 0.5, 1), 0, 0);
          } else {
            material.color = new Color(-((1 - x) ** 2) + 1, -(x ** 2) + 1, 0);
          }
          material.opacity = 1;
          break;

        case 'ArmorScreen':
          if (!showArmorScreen) return null;

          material.color = new Color(
            clamp(1 - (7 / 8) * xClamped, 0, 1),
            0,
            clamp(1 - (1 / 8) * xClamped, 0, 1),
          );
          material.opacity = clamp(x + 1 / 2, 0, 1);

          break;

        default:
          if (!showModules) return null;

          material.color = moduleColor;
          material.opacity = 1 / 2;

          break;
      }

      const outlineMaterial = new LineBasicMaterial({
        color: material.color.clone(),
      });

      switch (armorPlate.type) {
        case 'Armor':
          outlineMaterial.color.multiplyScalar(0.5);
          break;

        case 'ArmorScreen':
          outlineMaterial.color.multiplyScalar(4);
          break;

        default:
          outlineMaterial.color.multiplyScalar(0.5);
          break;
      }

      material.opacity = clamp(material.opacity, 0, 1);
      material.transparent = material.opacity < 1;

      return (
        <>
          <mesh {...props} material={material} />

          <lineSegments material={outlineMaterial}>
            <edgesGeometry args={[props.geometry, 45]} />
          </lineSegments>
        </>
      );
    },
  });
}

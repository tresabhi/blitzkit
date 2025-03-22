import { asset } from '@blitzkit/core';
import { useGLTF } from '@react-three/drei';
import {
  Color,
  DoubleSide,
  LineBasicMaterial,
  Material,
  MeshStandardMaterial,
} from 'three';
import { jsxTree } from '../../../core/blitzkit/jsxTree';
import { Duel } from '../../../stores/duel';
import { TankopediaEphemeral } from '../../../stores/tankopediaEphemeral';
import { groupNameRegex } from './StaticArmorSceneComponent';

interface DissectorSceneComponentProps {
  group: string;
}

const armorColor = new Color().multiplyScalar(1 / 16);

const moduleColor: Record<string, Color> = {
  Armor: armorColor,
  ArmorScreen: armorColor,

  Commander: new Color('white'),
  Driver: new Color('white'),
  Gunner1: new Color('white'),
  Loader1: new Color('white'),

  SurveyingDevice: new Color('purple'),
  Radio: new Color('indigo'),
  Gun: new Color('pink'),
  FuelTank: new Color('yellow'),
  Engine: new Color('orange'),
  AmmoBay: new Color('gold'),
  LeftTrack: new Color('green'),
  RightTrack: new Color('green'),
  TurretRotator: new Color('blue'),
  Transmission: new Color('cyan'),
};
const moduleOutlineColor: Record<string, Color> = {};

for (const key in moduleColor) {
  moduleOutlineColor[key] = moduleColor[key].clone().multiplyScalar(4);
}

export function DissectorSceneComponent({
  group,
}: DissectorSceneComponentProps) {
  const tank = Duel.use((state) => state.protagonist.tank);
  const gltf = useGLTF(asset(`tanks/${tank.id}/collision/${group}.glb`));
  const armor = TankopediaEphemeral.use((state) => state.armor);
  const groupName = group.match(groupNameRegex)![1];
  const groupArmor = armor.groups[groupName];

  return jsxTree(gltf.scene, {
    mesh(mesh, props) {
      if (!(mesh.material instanceof Material)) {
        return null;
      }

      const armorName = mesh.material.name;
      const armorPlate = groupArmor.armors[armorName];

      if (!(armorPlate.type in moduleColor)) {
        throw new TypeError(`Unhandled armor type: ${armorPlate.type}`);
      }

      const material = new MeshStandardMaterial({
        side: DoubleSide,
        color: moduleColor[armorPlate.type],
      });
      const outlineMaterial = new LineBasicMaterial({
        side: DoubleSide,
        color: moduleOutlineColor[armorPlate.type],
      });

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

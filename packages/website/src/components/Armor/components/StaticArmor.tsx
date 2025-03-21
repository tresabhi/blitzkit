import { asset } from '@blitzkit/core';
import { useGLTF } from '@react-three/drei';
import { memo } from 'react';
import { Color, Material, MeshBasicMaterial } from 'three';
import { jsxTree } from '../../../core/blitzkit/jsxTree';
import { Duel } from '../../../stores/duel';
import { TankopediaEphemeral } from '../../../stores/tankopediaEphemeral';

interface ArmorSceneProps {
  thicknessRange: ThicknessRange;
}

export interface ThicknessRange {
  value: number;
}

export const StaticArmor = memo<ArmorSceneProps>(({ thicknessRange }) => {
  // const wrapper = useRef<Group>(null);
  // const turretContainer = useRef<Group>(null);
  // const gunContainer = useRef<Group>(null);
  // const protagonist = Duel.use((draft) => draft.protagonist);
  // const tank = Duel.use((state) => state.protagonist.tank);
  // const track = Duel.use((state) => state.protagonist.track);
  // const turret = Duel.use((state) => state.protagonist.turret);
  // const gun = Duel.use((state) => state.protagonist.gun);
  // const { gltf: armorGltf } = useArmor(tank.id);
  // const { gltf: modelGltf } = useModel(tank.id);
  // const armorNodes = Object.values(armorGltf.nodes);
  // const modelNodes = Object.values(modelGltf.nodes);
  // const tankModelDefinition = useTankModelDefinition();
  // const trackModelDefinition = tankModelDefinition.tracks[track.id];
  // const turretModelDefinition = tankModelDefinition.turrets[turret.id];
  // const gunModelDefinition =
  //   turretModelDefinition.guns[gun.gun_type!.value.base.id];
  // const hullOrigin = correctZYTuple(trackModelDefinition.origin);
  // const turretOrigin = correctZYTuple(tankModelDefinition.turret_origin);
  // const gunOrigin = correctZYTuple(turretModelDefinition.gun_origin);
  // const mutateDuel = Duel.useMutation();
  // const canvas = useThree((state) => state.gl.domElement);
  // const mutateTankopediaEphemeral = TankopediaEphemeral.useMutation();
  // const duelStore = Duel.useStore();
  // const maskOrigin =
  //   gunModelDefinition.mask === undefined
  //     ? undefined
  //     : gunModelDefinition.mask + hullOrigin.y + turretOrigin.y + gunOrigin.y;
  // const showPrimaryArmor = TankopediaPersistent.use(
  //   (state) => state.showPrimaryArmor,
  // );
  // const showSpacedArmor = TankopediaPersistent.use(
  //   (state) => state.showSpacedArmor,
  // );
  // const showExternalModules = TankopediaPersistent.use(
  //   (state) => state.showExternalModules,
  // );
  // const isDynamicArmorActive = Duel.use((state) =>
  //   state.protagonist.consumables.includes(73),
  // );

  // useTankTransform(track, turret, turretContainer, gunContainer);

  const tank = Duel.use((state) => state.protagonist.tank);
  const armor = TankopediaEphemeral.use((state) => state.armor);
  const hullArmor = armor.groups.hull;
  const hullGltf = useGLTF(asset(`tanks/${tank.id}/collision/hull.glb`));

  return (
    <group>
      {jsxTree(hullGltf.scene, {
        mesh(mesh) {
          if (!(mesh.material instanceof Material)) {
            return { visible: false };
          }

          const armorName = mesh.material.name;
          const material = new MeshBasicMaterial({});
          const armorPlate = hullArmor.armors[armorName];

          switch (armorPlate.type) {
            case 'Armor':
              material.color = new Color('#ec6142');
              material.transparent = true;
              material.opacity = 0.5;
              break;

            case 'ArmorScreen':
              material.color = new Color('#ff8dcc');
              material.transparent = true;
              material.opacity = 0.5;
              break;

            default:
              material.color = new Color('#70b8ff');
              break;
          }

          return { material };
        },
      })}
    </group>
  );
});

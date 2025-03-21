import { memo } from 'react';
import { StaticArmorSceneComponents } from './StaticArmorSceneComponents';

export interface ThicknessRange {
  value: number;
}

export const StaticArmor = memo(() => {
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

  return (
    <group>
      <StaticArmorSceneComponents group="hull" />
      <StaticArmorSceneComponents group="chassis" />
      <group position={[0.7, 1.6, 0]}>
        <StaticArmorSceneComponents group="turret_01" />
        <group position={[1, 0.36, 0]}>
          <StaticArmorSceneComponents group="gun_01" />
        </group>
      </group>
    </group>
  );
});

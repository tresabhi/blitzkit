import { Scene } from 'three';
import { arrayfy } from '../../../core/three/arrayfy';
import { Duel } from '../../../stores/duel';
import { TankopediaEphemeral } from '../../../stores/tankopediaEphemeral';
import { SpacedArmorSceneComponent } from './SpacedArmorSceneComponent/index';

export enum ArmorType {
  Primary,
  Spaced,
  External,
}

interface SpacedArmorSceneProps {
  scene: Scene;
}

export function SpacedArmorScene({ scene }: SpacedArmorSceneProps) {
  const model = TankopediaEphemeral.use((state) => state.model);
  const turret = Duel.use((state) => state.protagonist.turret);
  const gun = Duel.use((state) => state.protagonist.gun);
  const turretTranslation = arrayfy(model.modules[turret.id].translation);
  const gunTranslation = arrayfy(model.modules[gun.id].translation);

  return (
    <group>
      <SpacedArmorSceneComponent group="hull" />
      <SpacedArmorSceneComponent group="chassis" />

      <group position={turretTranslation}>
        <SpacedArmorSceneComponent group={turret.id} />
      </group>

      <group position={gunTranslation}>
        <SpacedArmorSceneComponent group={gun.id} />
      </group>
    </group>
  );
}

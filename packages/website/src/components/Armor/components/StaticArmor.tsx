import { arrayfy } from '../../../core/three/arrayfy';
import { Duel } from '../../../stores/duel';
import { TankopediaEphemeral } from '../../../stores/tankopediaEphemeral';
import { StaticArmorSceneComponent } from './StaticArmorSceneComponent';

export interface ThicknessRange {
  value: number;
}

export function StaticArmor() {
  const model = TankopediaEphemeral.use((state) => state.model);
  const turret = Duel.use((state) => state.protagonist.turret);
  const gun = Duel.use((state) => state.protagonist.gun);
  const turretTranslation = arrayfy(model.modules[turret.id].translation);
  const gunTranslation = arrayfy(model.modules[gun.id].translation);

  return (
    <group>
      <StaticArmorSceneComponent group="hull" />
      <StaticArmorSceneComponent group="chassis" />

      <group position={turretTranslation}>
        <StaticArmorSceneComponent group={turret.id} />
      </group>

      <group position={gunTranslation}>
        <StaticArmorSceneComponent group={gun.id} />
      </group>
    </group>
  );
}

import { memo } from 'react';
import { StaticArmorSceneComponent } from './StaticArmorSceneComponent';

export interface ThicknessRange {
  value: number;
}

export const StaticArmor = memo(() => {
  return (
    <group>
      <StaticArmorSceneComponent group="hull" />
      <StaticArmorSceneComponent group="chassis" />

      <group position={[65.92709 / 100, 155.5313 / 100, 0.022151405 / 100]}>
        <StaticArmorSceneComponent group="turret_01" />
      </group>

      <group position={[194.92838 / 100, 190.19179 / 100, 0.06545235 / 100]}>
        <StaticArmorSceneComponent group="gun_01" />
      </group>
    </group>
  );
});

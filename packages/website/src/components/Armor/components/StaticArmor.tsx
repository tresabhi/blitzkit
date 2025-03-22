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
      <group position={[0.7, 1.6, 0]}>
        <StaticArmorSceneComponent group="turret_01" />
        <group position={[1, 0.36, 0]}>
          <StaticArmorSceneComponent group="gun_01" />
        </group>
      </group>
    </group>
  );
});

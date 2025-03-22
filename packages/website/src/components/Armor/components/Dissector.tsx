import { memo } from 'react';
import { DissectorSceneComponent } from './DissectorSceneComponent';

export const Dissector = memo(() => {
  return (
    <group>
      <DissectorSceneComponent group="hull" />
      <DissectorSceneComponent group="chassis" />
      <group position={[0.7, 1.6, 0]}>
        <DissectorSceneComponent group="turret_01" />
        <group position={[1, 0.36, 0]}>
          <DissectorSceneComponent group="gun_01" />
        </group>
      </group>
    </group>
  );
});

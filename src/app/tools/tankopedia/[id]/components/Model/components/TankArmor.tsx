import { forwardRef } from 'react';
import { Group } from 'three';
import { HeadsUpDisplay } from '../../../../../../../components/HeadsUpDisplay';

interface TankArmorProps {}

export const TankArmor = forwardRef<Group, TankArmorProps>((_props, ref) => {
  return (
    <HeadsUpDisplay>
      <mesh>
        <boxGeometry />
        <meshBasicMaterial color="red" />
      </mesh>

      {/* {armorObjects.map((object) => {
        const isHull = object.name.startsWith('hull_');
        const isVisible = isHull;

        if (!isVisible) return null;

        return (
          <ArmorMesh key={object.uuid} geometry={(object as Mesh).geometry} />
        );
      })} */}

      {/* {armorObjects.map((object) => {
          const isCurrentTurret = object.name.startsWith(
            `turret_${model.toString().padStart(2, '0')}`,
          );
          const isVisible = isCurrentTurret;

          if (!isVisible) return null;

          return (
            <mesh
              position={turretOrigin}
              key={object.uuid}
              geometry={(object as Mesh).geometry}
            >
              <ArmorMesh />
            </mesh>
          );
        })} */}

      {/* {armorObjects.map((object) => {
          const isCurrentGun = object.name.startsWith(
            `gun_${model.toString().padStart(2, '0')}`,
          );
          const isVisible = isCurrentGun;

          if (!isVisible) return null;

          return (
            <mesh
              position={turretOrigin.clone().add(gunOrigin)}
              key={object.uuid}
              geometry={(object as Mesh).geometry}
            >
              <ArmorHighlightMaterial />
            </mesh>
          );
        })} */}
    </HeadsUpDisplay>
  );
});

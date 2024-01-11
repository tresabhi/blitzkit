import { GroupProps, useLoader } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import { Euler, Mesh, Vector3 } from 'three';
import { GLTFLoader } from 'three-stdlib';
import { ArmorMesh } from '../../../../../../../components/ArmorMesh';
import { HeadsUpDisplay } from '../../../../../../../components/HeadsUpDisplay';
import { X_AXIS } from '../../../../../../../constants/axis';
import { numericPenetration } from '../../../../../../../core/blitz/numericPenetration';
import { asset } from '../../../../../../../core/blitzkrieg/asset';
import {
  ModelDefinitions,
  modelDefinitions,
} from '../../../../../../../core/blitzkrieg/modelDefinitions';
import { useTankopedia } from '../../../../../../../stores/tankopedia';
import { Lighting } from '../../Lighting';

interface TankArmorProps extends GroupProps {}

export function TankArmor({ ...props }: TankArmorProps) {
  const controlsEnabled = useTankopedia((state) => state.model.controlsEnabled);
  const [awaitedModelDefinitions, setAwaitedModelDefinitions] = useState<
    ModelDefinitions | undefined
  >(undefined);
  const protagonist = useTankopedia((state) => {
    if (!state.areTanksAssigned) return;
    return state.protagonist;
  });
  const antagonist = useTankopedia((state) => {
    if (!state.areTanksAssigned) return;
    return state.antagonist;
  });
  const showSpacedArmor = useTankopedia((state) => state.model.showSpacedArmor);

  if (!protagonist || !antagonist) return null;

  const gltf = useLoader(
    GLTFLoader,
    asset(`3d/tanks/armor/${protagonist.tank.id}.glb`),
  );
  const model = useTankopedia((state) => state.model);

  useEffect(() => {
    (async () => {
      setAwaitedModelDefinitions(await modelDefinitions);
    })();
  }, []);

  if (!awaitedModelDefinitions) return null;

  const nodes = Object.values(gltf.nodes);
  const tankModelDefinition = awaitedModelDefinitions[protagonist.tank.id];
  const turretModelDefinition =
    tankModelDefinition.turrets[protagonist.turret.id];
  const gunModelDefinition = turretModelDefinition.guns[protagonist.gun.id];
  const turretOrigin = new Vector3(
    tankModelDefinition.turretOrigin[0],
    tankModelDefinition.turretOrigin[1],
    -tankModelDefinition.turretOrigin[2],
  ).applyAxisAngle(X_AXIS, Math.PI / 2);
  const gunOrigin = new Vector3(
    turretModelDefinition.gunOrigin[0],
    turretModelDefinition.gunOrigin[1],
    -turretModelDefinition.gunOrigin[2],
  ).applyAxisAngle(X_AXIS, Math.PI / 2);
  const turretPosition = new Vector3()
    .sub(turretOrigin)
    .applyAxisAngle(new Vector3(0, 0, 1), model.turretYaw);
  const turretRotation = new Euler(0, 0, model.turretYaw);

  if (tankModelDefinition.turretRotation) {
    const pitch = -tankModelDefinition.turretRotation.pitch * (Math.PI / 180);
    const yaw = -tankModelDefinition.turretRotation.yaw * (Math.PI / 180);
    const roll = -tankModelDefinition.turretRotation.roll * (Math.PI / 180);

    turretPosition
      .applyAxisAngle(new Vector3(1, 0, 0), pitch)
      .applyAxisAngle(new Vector3(0, 1, 0), roll)
      .applyAxisAngle(new Vector3(0, 0, 1), yaw);
    turretRotation.x += pitch;
    turretRotation.y += roll;
    turretRotation.z += yaw;
  }

  turretPosition.add(turretOrigin);

  return (
    <HeadsUpDisplay>
      <Lighting />

      <group
        {...props}
        rotation={[-Math.PI / 2, 0, model.hullYaw]}
        visible={controlsEnabled}
      >
        {nodes.map((node) => {
          const isHull = node.name.startsWith('hull_');
          const armorId = parseInt(node.name.match(/.+_armor_(\d+)/)![1]);
          const isVisible = isHull;
          const thickness = tankModelDefinition.armor.thickness[armorId];
          const isSpaced = tankModelDefinition.armor.spaced?.includes(armorId);

          if (
            !isVisible ||
            thickness === undefined ||
            (isSpaced && !showSpacedArmor)
          )
            return null;
          return (
            <ArmorMesh
              spaced={isSpaced}
              key={node.uuid}
              geometry={(node as Mesh).geometry}
              thickness={thickness}
              penetration={numericPenetration(antagonist.shell.penetration)}
              ricochet={antagonist.shell.ricochet}
              caliber={antagonist.shell.caliber}
              normalization={antagonist.shell.normalization}
            />
          );
        })}

        <group position={turretPosition} rotation={turretRotation}>
          {nodes.map((node) => {
            const isCurrentTurret = node.name.startsWith(
              `turret_${turretModelDefinition.model
                .toString()
                .padStart(2, '0')}`,
            );
            const isVisible = isCurrentTurret;
            const armorId = parseInt(node.name.match(/.+_armor_(\d+)/)![1]);
            const thickness = turretModelDefinition.armor.thickness[armorId];
            const isSpaced =
              turretModelDefinition.armor.spaced?.includes(armorId);

            if (
              !isVisible ||
              thickness === undefined ||
              (isSpaced && !showSpacedArmor)
            )
              return null;
            return (
              <ArmorMesh
                spaced={isSpaced}
                key={node.uuid}
                position={turretOrigin}
                geometry={(node as Mesh).geometry}
                thickness={thickness}
                penetration={numericPenetration(antagonist.shell.penetration)}
                ricochet={antagonist.shell.ricochet}
                caliber={antagonist.shell.caliber}
                normalization={antagonist.shell.normalization}
              />
            );
          })}

          <group
            position={new Vector3()
              .sub(turretOrigin)
              .sub(gunOrigin)
              .applyAxisAngle(new Vector3(1, 0, 0), model.gunPitch)
              .add(turretOrigin)
              .add(gunOrigin)}
            rotation={[model.gunPitch, 0, 0]}
          >
            {nodes.map((node) => {
              const isCurrentGun = node.name.startsWith(
                `gun_${gunModelDefinition.model.toString().padStart(2, '0')}`,
              );
              const isVisible = isCurrentGun;
              const armorId = parseInt(node.name.match(/.+_armor_(\d+)/)![1]);
              const thickness = gunModelDefinition.armor.thickness[armorId];
              const isSpaced =
                gunModelDefinition.armor.spaced?.includes(armorId);

              if (
                !isVisible ||
                thickness === undefined ||
                (isSpaced && !showSpacedArmor)
              )
                return null;
              return (
                <ArmorMesh
                  spaced={isSpaced}
                  key={node.uuid}
                  position={turretOrigin.clone().add(gunOrigin)}
                  geometry={(node as Mesh).geometry}
                  thickness={thickness}
                  penetration={numericPenetration(antagonist.shell.penetration)}
                  ricochet={antagonist.shell.ricochet}
                  caliber={antagonist.shell.caliber}
                  normalization={antagonist.shell.normalization}
                />
              );
            })}
          </group>
        </group>
      </group>
    </HeadsUpDisplay>
  );
}
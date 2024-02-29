import { memo, useEffect, useRef } from 'react';
import { Euler, Group, Scene, Vector3 } from 'three';
import { degToRad } from 'three/src/math/MathUtils';
import { I_HAT, J_HAT, K_HAT } from '../../../constants/axis';
import {
  ModelTransformEventData,
  modelTransformEvent,
} from '../../../core/blitzkrieg/modelTransform';
import { nameToArmorId } from '../../../core/blitzkrieg/nameToArmorId';
import { resolveArmor } from '../../../core/blitzkrieg/resolveThickness';
import { useArmor } from '../../../hooks/useArmor';
import { useModel } from '../../../hooks/useModel';
import { useModelDefinitions } from '../../../hooks/useModelDefinitions';
import { useDuel } from '../../../stores/duel';
import { useTankopediaPersistent } from '../../../stores/tankopedia';
import { SpacedArmorSceneComponent } from './SpacedArmorSceneComponent';

export enum ArmorType {
  Core,
  Spaced,
  External,
}

interface SpacedArmorSceneProps {
  scene: Scene;
}

export const SpacedArmorScene = memo<SpacedArmorSceneProps>(({ scene }) => {
  const wrapper = useRef<Group>(null);
  const modelDefinitions = useModelDefinitions();
  const turretContainer = useRef<Group>(null);
  const gunContainer = useRef<Group>(null);
  const initialTankopediaState = useTankopediaPersistent.getState();

  useEffect(() => {
    if (!modelDefinitions) return;

    const hullOrigin = new Vector3(
      trackModelDefinition.origin[0],
      trackModelDefinition.origin[1],
      -trackModelDefinition.origin[2],
    ).applyAxisAngle(I_HAT, Math.PI / 2);
    const turretOrigin = new Vector3(
      tankModelDefinition.turretOrigin[0],
      tankModelDefinition.turretOrigin[1],
      -tankModelDefinition.turretOrigin[2],
    ).applyAxisAngle(I_HAT, Math.PI / 2);
    const gunOrigin = new Vector3(
      turretModelDefinition.gunOrigin[0],
      turretModelDefinition.gunOrigin[1],
      -turretModelDefinition.gunOrigin[2],
    ).applyAxisAngle(I_HAT, Math.PI / 2);
    const turretPosition = new Vector3();
    const turretRotation = new Euler();
    const gunPosition = new Vector3();
    const gunRotation = new Euler();

    function handleModelTransform({ yaw, pitch }: ModelTransformEventData) {
      gunPosition
        .set(0, 0, 0)
        .sub(hullOrigin)
        .sub(turretOrigin)
        .sub(gunOrigin)
        .applyAxisAngle(I_HAT, pitch)
        .add(gunOrigin)
        .add(turretOrigin)
        .add(hullOrigin);
      gunRotation.set(pitch, 0, 0);
      gunContainer.current?.position.copy(gunPosition);
      gunContainer.current?.rotation.copy(gunRotation);

      if (yaw === undefined) return;

      turretPosition
        .set(0, 0, 0)
        .sub(hullOrigin)
        .sub(turretOrigin)
        .applyAxisAngle(new Vector3(0, 0, 1), yaw);
      turretRotation.set(0, 0, yaw);

      if (tankModelDefinition.turretRotation) {
        const initialPitch = -degToRad(
          tankModelDefinition.turretRotation.pitch,
        );
        const initialYaw = -degToRad(tankModelDefinition.turretRotation.yaw);
        const initialRoll = -degToRad(tankModelDefinition.turretRotation.roll);

        turretPosition
          .applyAxisAngle(I_HAT, initialPitch)
          .applyAxisAngle(J_HAT, initialRoll)
          .applyAxisAngle(K_HAT, initialYaw);
        turretRotation.x += initialPitch;
        turretRotation.y += initialRoll;
        turretRotation.z += initialYaw;
      }

      turretPosition.add(turretOrigin).add(hullOrigin);
      turretContainer.current?.position.copy(turretPosition);
      turretContainer.current?.rotation.copy(turretRotation);
    }

    handleModelTransform(useDuel.getState().protagonist!);
    modelTransformEvent.on(handleModelTransform);

    return () => {
      modelTransformEvent.off(handleModelTransform);
    };
  });

  useEffect(() => {
    const unsubscribe = useTankopediaPersistent.subscribe(
      (state) => state.mode,
      (mode) => {
        if (wrapper.current) wrapper.current.visible = mode === 'armor';
      },
    );

    return unsubscribe;
  });

  const tank = useDuel((state) => state.protagonist!.tank);
  const track = useDuel((state) => state.protagonist!.track);
  const turret = useDuel((state) => state.protagonist!.turret);
  const gun = useDuel((state) => state.protagonist!.gun);
  const armorGltf = useArmor(tank.id);
  const { gltf: modelGltf } = useModel(tank.id);
  const armorNodes = Object.values(armorGltf.nodes);
  const modelNodes = Object.values(modelGltf.nodes);
  const tankModelDefinition = modelDefinitions[tank.id];
  const trackModelDefinition = tankModelDefinition.tracks[track.id];
  const turretModelDefinition = tankModelDefinition.turrets[turret.id];
  const gunModelDefinition = turretModelDefinition.guns[gun.id];
  const hullOrigin = new Vector3(
    trackModelDefinition.origin[0],
    trackModelDefinition.origin[1],
    -trackModelDefinition.origin[2],
  ).applyAxisAngle(I_HAT, Math.PI / 2);
  const turretOrigin = new Vector3(
    tankModelDefinition.turretOrigin[0],
    tankModelDefinition.turretOrigin[1],
    -tankModelDefinition.turretOrigin[2],
  ).applyAxisAngle(I_HAT, Math.PI / 2);
  const gunOrigin = new Vector3(
    turretModelDefinition.gunOrigin[0],
    turretModelDefinition.gunOrigin[1],
    -turretModelDefinition.gunOrigin[2],
  ).applyAxisAngle(I_HAT, Math.PI / 2);

  return (
    <group
      ref={wrapper}
      rotation={[-Math.PI / 2, 0, 0]}
      visible={initialTankopediaState.mode === 'armor'}
    >
      <group position={hullOrigin}>
        {armorNodes.map((node) => {
          const isHull = node.name.startsWith('hull_');
          const isVisible = isHull;
          const armorId = nameToArmorId(node.name);
          const { spaced, thickness } = resolveArmor(
            tankModelDefinition.armor,
            armorId,
          );

          if (!isVisible || thickness === undefined) return null;

          return (
            <SpacedArmorSceneComponent
              scene={scene}
              key={node.uuid}
              type={spaced ? ArmorType.Spaced : ArmorType.Core}
              thickness={thickness}
              node={node}
            />
          );
        })}
      </group>
      {modelNodes.map((node) => {
        const isWheel = node.name.startsWith('chassis_wheel_');
        const isTrack = node.name.startsWith('chassis_track_');
        const isVisible = isWheel || isTrack;

        if (!isVisible) return null;

        return (
          <SpacedArmorSceneComponent
            scene={scene}
            key={node.uuid}
            type={ArmorType.External}
            thickness={trackModelDefinition.thickness}
            variant="track"
            node={node}
          />
        );
      })}

      <group ref={turretContainer}>
        <group position={hullOrigin}>
          {armorNodes.map((node) => {
            const isCurrentTurret = node.name.startsWith(
              `turret_${turretModelDefinition.model.toString().padStart(2, '0')}`,
            );
            const isVisible = isCurrentTurret;
            const armorId = nameToArmorId(node.name);
            const { spaced, thickness } = resolveArmor(
              turretModelDefinition.armor,
              armorId,
            );

            if (!isVisible || thickness === undefined) return null;

            return (
              <group key={node.uuid} position={turretOrigin}>
                <SpacedArmorSceneComponent
                  scene={scene}
                  key={node.uuid}
                  type={spaced ? ArmorType.Spaced : ArmorType.Core}
                  thickness={thickness}
                  node={node}
                />
              </group>
            );
          })}
        </group>
        <group ref={gunContainer}>
          <group position={hullOrigin}>
            {armorNodes.map((node) => {
              const isCurrentGun = node.name.startsWith(
                `gun_${gunModelDefinition.model.toString().padStart(2, '0')}`,
              );
              const isVisible = isCurrentGun;
              const armorId = nameToArmorId(node.name);
              const { spaced, thickness } = resolveArmor(
                gunModelDefinition.armor,
                armorId,
              );

              if (!isVisible || thickness === undefined) return null;

              return (
                <group
                  key={node.uuid}
                  position={turretOrigin.clone().add(gunOrigin)}
                >
                  <SpacedArmorSceneComponent
                    scene={scene}
                    type={spaced ? ArmorType.Spaced : ArmorType.Core}
                    thickness={thickness}
                    node={node}
                  />
                </group>
              );
            })}
          </group>

          {modelNodes.map((node) => {
            const isCurrentGun =
              node.name ===
              `gun_${gunModelDefinition.model.toString().padStart(2, '0')}`;
            const isVisible = isCurrentGun;

            if (!isVisible) return null;

            return (
              <SpacedArmorSceneComponent
                scene={scene}
                key={node.uuid}
                type={ArmorType.External}
                thickness={gunModelDefinition.thickness}
                variant="gun"
                node={node}
              />
            );
          })}
        </group>
      </group>
    </group>
  );
});

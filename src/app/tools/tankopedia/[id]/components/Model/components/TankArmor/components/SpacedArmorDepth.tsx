import { memo, useEffect, useRef } from 'react';
import { Euler, Group, Mesh, Vector3 } from 'three';
import { degToRad } from 'three/src/math/MathUtils';
import { ArmorMeshSpacedArmorDepth } from '../../../../../../../../../components/ArmorMesh/components/SpacedArmorDepth';
import { I_HAT, J_HAT, K_HAT } from '../../../../../../../../../constants/axis';
import {
  ModelTransformEventData,
  modelTransformEvent,
} from '../../../../../../../../../core/blitzkrieg/modelTransform';
import { nameToArmorId } from '../../../../../../../../../core/blitzkrieg/nameToArmorId';
import { resolveArmor } from '../../../../../../../../../core/blitzkrieg/resolveThickness';
import { useArmor } from '../../../../../../../../../hooks/useArmor';
import { useModel } from '../../../../../../../../../hooks/useModel';
import { useModelDefinitions } from '../../../../../../../../../hooks/useModelDefinitions';
import { useDuel } from '../../../../../../../../../stores/duel';
import { useTankopediaPersistent } from '../../../../../../../../../stores/tankopedia';

interface SpacedArmorDepthProps {
  ornamental?: boolean;
}

/**
 * When rendered, this component provides the depth buffer for the armor which
 * when compared to the depth of the core armor will give you the distance
 * between the first point of contact and the core armor. The color channels
 * hold information about the thickness of the spaced armor (external modules
 * not included).
 * - R: angle of the armor where 0 is 0 and 1 is 90
 * - G: normalized thickness; multiply with max thickness to get nominal thickness
 * - B: no data
 * - A: 1 means is armor; 0 is background
 */
export const SpacedArmorDepth = memo<SpacedArmorDepthProps>(
  ({ ornamental = false }) => {
    const protagonist = useDuel((state) => state.protagonist!);
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
          const initialRoll = -degToRad(
            tankModelDefinition.turretRotation.roll,
          );

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

    const armorGltf = useArmor(protagonist.tank.id);
    const { gltf: modelGltf } = useModel(protagonist.tank.id);

    const armorNodes = Object.values(armorGltf.nodes);
    const modelNodes = Object.values(modelGltf.nodes);
    const tankModelDefinition = modelDefinitions[protagonist.tank.id];
    const trackModelDefinition =
      tankModelDefinition.tracks[protagonist.track.id];
    const turretModelDefinition =
      tankModelDefinition.turrets[protagonist.turret.id];
    const gunModelDefinition = turretModelDefinition.guns[protagonist.gun.id];
    const maxThickness = Math.max(
      trackModelDefinition.thickness,
      gunModelDefinition.thickness,
      ...armorNodes
        .map((node) => {
          const armorId = nameToArmorId(node.name);
          return resolveArmor(tankModelDefinition.armor, armorId).thickness;
        })
        .filter(Boolean),
    );
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
              <ArmorMeshSpacedArmorDepth
                ornamental={ornamental}
                include={spaced}
                isExternalModule={false}
                thickness={thickness}
                maxThickness={maxThickness}
                key={node.uuid}
                geometry={(node as Mesh).geometry}
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
            <ArmorMeshSpacedArmorDepth
              ornamental={ornamental}
              isExternalModule
              key={node.uuid}
              geometry={(node as Mesh).geometry}
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
                <ArmorMeshSpacedArmorDepth
                  ornamental={ornamental}
                  include={spaced}
                  isExternalModule={false}
                  thickness={thickness}
                  maxThickness={maxThickness}
                  key={node.uuid}
                  geometry={(node as Mesh).geometry}
                  position={turretOrigin}
                />
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
                  <ArmorMeshSpacedArmorDepth
                    ornamental={ornamental}
                    include={spaced}
                    isExternalModule={false}
                    thickness={thickness}
                    maxThickness={maxThickness}
                    key={node.uuid}
                    geometry={(node as Mesh).geometry}
                    position={turretOrigin.clone().add(gunOrigin)}
                  />
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
                <ArmorMeshSpacedArmorDepth
                  ornamental={ornamental}
                  isExternalModule
                  key={node.uuid}
                  geometry={(node as Mesh).geometry}
                />
              );
            })}
          </group>
        </group>
      </group>
    );
  },
);

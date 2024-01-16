import { memo, useEffect, useRef } from 'react';
import { Euler, Group, Mesh, Vector3 } from 'three';
import { degToRad } from 'three/src/math/MathUtils';
import { ArmorMeshSpacedArmorDepth } from '../../../../../../../../../components/ArmorMesh/components/SpacedArmorDepth';
import {
  X_AXIS,
  Y_AXIS,
  Z_AXIS,
} from '../../../../../../../../../constants/axis';
import {
  ModelTransformEventData,
  modelTransformEvent,
} from '../../../../../../../../../core/blitzkrieg/modelTransform';
import { nameToArmorId } from '../../../../../../../../../core/blitzkrieg/nameToArmorId';
import { resolveArmor } from '../../../../../../../../../core/blitzkrieg/resolveThickness';
import { useArmor } from '../../../../../../../../../hooks/useArmor';
import { useModel } from '../../../../../../../../../hooks/useModel';
import { useModelDefinitions } from '../../../../../../../../../hooks/useModelDefinitions';
import { useTankopedia } from '../../../../../../../../../stores/tankopedia';
import { Duel } from '../../../../../page';

interface SpacedArmorDepthProps {
  duel: Duel;
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
export const SpacedArmorDepth = memo<SpacedArmorDepthProps>(({ duel }) => {
  const wrapper = useRef<Group>(null);
  const modelDefinitions = useModelDefinitions();
  const turretContainer = useRef<Group>(null);
  const gunContainer = useRef<Group>(null);
  const initialTankopediaState = useTankopedia.getState();

  useEffect(() => {
    if (!modelDefinitions) return;

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
    const turretPosition = new Vector3();
    const turretRotation = new Euler();
    const gunPosition = new Vector3();
    const gunRotation = new Euler();

    function handleModelTransform({ yaw, pitch }: ModelTransformEventData) {
      gunPosition
        .set(0, 0, 0)
        .sub(turretOrigin)
        .sub(gunOrigin)
        .applyAxisAngle(X_AXIS, pitch)
        .add(gunOrigin)
        .add(turretOrigin);
      gunRotation.set(pitch, 0, 0);
      gunContainer.current?.position.copy(gunPosition);
      gunContainer.current?.rotation.copy(gunRotation);

      if (yaw === undefined) return;

      turretPosition
        .set(0, 0, 0)
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
          .applyAxisAngle(X_AXIS, initialPitch)
          .applyAxisAngle(Y_AXIS, initialRoll)
          .applyAxisAngle(Z_AXIS, initialYaw);
        turretRotation.x += initialPitch;
        turretRotation.y += initialRoll;
        turretRotation.z += initialYaw;
      }

      turretPosition.add(turretOrigin);
      turretContainer.current?.position.copy(turretPosition);
      turretContainer.current?.rotation.copy(turretRotation);
    }

    handleModelTransform(useTankopedia.getState().model.physical);
    modelTransformEvent.on(handleModelTransform);

    return () => {
      modelTransformEvent.off(handleModelTransform);
    };
  });

  useEffect(() => {
    const unsubscribe = useTankopedia.subscribe(
      (state) => state.mode,
      (mode) => {
        if (wrapper.current) wrapper.current.visible = mode === 'armor';
      },
    );

    return unsubscribe;
  });

  const armorGltf = useArmor(duel.protagonist.tank.id);
  const modelGltf = useModel(duel.protagonist.tank.id);

  const armorNodes = Object.values(armorGltf.nodes);
  const modelNodes = Object.values(modelGltf.nodes);
  const tankModelDefinition = modelDefinitions[duel.protagonist.tank.id];
  const turretModelDefinition =
    tankModelDefinition.turrets[duel.protagonist.turret.id];
  const gunModelDefinition =
    turretModelDefinition.guns[duel.protagonist.gun.id];
  const maxThickness = Math.max(
    ...armorNodes
      .map((node) => {
        const armorId = nameToArmorId(node.name);
        const { spaced, thickness } = resolveArmor(
          tankModelDefinition.armor,
          armorId,
        );

        return spaced ? thickness : null;
      })
      .filter(Boolean),
  );
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

  return (
    <group
      ref={wrapper}
      rotation={[-Math.PI / 2, 0, 0]}
      visible={initialTankopediaState.mode === 'armor'}
    >
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
            include={spaced}
            thickness={thickness}
            maxThickness={maxThickness}
            key={node.uuid}
            geometry={(node as Mesh).geometry}
          />
        );
      })}

      {modelNodes.map((node) => {
        const isWheel = node.name.startsWith('chassis_wheel_');
        const isTrack = node.name.startsWith('chassis_track_');
        const isVisible = isWheel || isTrack;

        if (!isVisible) return null;

        return (
          <ArmorMeshSpacedArmorDepth
            key={node.uuid}
            geometry={(node as Mesh).geometry}
          />
        );
      })}

      <group ref={turretContainer}>
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
              include={spaced}
              thickness={thickness}
              maxThickness={maxThickness}
              key={node.uuid}
              geometry={(node as Mesh).geometry}
              position={turretOrigin}
            />
          );
        })}
        <group ref={gunContainer}>
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
                include={spaced}
                thickness={thickness}
                maxThickness={maxThickness}
                key={node.uuid}
                geometry={(node as Mesh).geometry}
                position={turretOrigin.clone().add(gunOrigin)}
              />
            );
          })}

          {modelNodes.map((node) => {
            const isCurrentGun =
              node.name ===
              `gun_${gunModelDefinition.model.toString().padStart(2, '0')}`;
            const isVisible = isCurrentGun;

            if (!isVisible) return null;

            return (
              <ArmorMeshSpacedArmorDepth
                key={node.uuid}
                geometry={(node as Mesh).geometry}
              />
            );
          })}
        </group>
      </group>
    </group>
  );
});

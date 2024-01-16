import { useLoader } from '@react-three/fiber';
import { memo, useEffect, useRef } from 'react';
import { Euler, Group, Mesh, Vector3 } from 'three';
import { GLTFLoader } from 'three-stdlib';
import { degToRad } from 'three/src/math/MathUtils';
import { ArmorMeshSpacedArmorDepth } from '../../../../../../../../../components/ArmorMesh/components/SpacedArmorDepth';
import {
  X_AXIS,
  Y_AXIS,
  Z_AXIS,
} from '../../../../../../../../../constants/axis';
import { asset } from '../../../../../../../../../core/blitzkrieg/asset';
import {
  ModelTransformEventData,
  modelTransformEvent,
} from '../../../../../../../../../core/blitzkrieg/modelTransform';
import { nameToArmorId } from '../../../../../../../../../core/blitzkrieg/nameToArmorId';
import { resolveArmor } from '../../../../../../../../../core/blitzkrieg/resolveThickness';
import { useModelDefinitions } from '../../../../../../../../../core/hooks/useModelDefinitions';
import { useTankopedia } from '../../../../../../../../../stores/tankopedia';
import { Duel } from '../../../../../page';

interface SpacedArmorDepthProps {
  duel: Duel;
}

export const SpacedArmorDepth = memo<SpacedArmorDepthProps>(({ duel }) => {
  const wrapper = useRef<Group>(null);
  const awaitedModelDefinitions = useModelDefinitions();
  const showSpacedArmor = useTankopedia(
    (state) => state.model.visual.showSpacedArmor,
  );
  const turretContainer = useRef<Group>(null);
  const gunContainer = useRef<Group>(null);
  const initialTankopediaState = useTankopedia.getState();

  useEffect(() => {
    if (!awaitedModelDefinitions) return;

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

    modelTransformEvent.on(handleModelTransform);

    return () => {
      modelTransformEvent.off(handleModelTransform);
    };
  }, [awaitedModelDefinitions]);

  useEffect(() => {
    const unsubscribe = useTankopedia.subscribe(
      (state) => state.mode,
      (mode) => {
        if (wrapper.current) wrapper.current.visible = mode === 'armor';
      },
    );

    return unsubscribe;
  });

  const armorGltf = useLoader(
    GLTFLoader,
    asset(`3d/tanks/armor/${duel.protagonist.tank.id}.glb`),
  );
  const modelGltf = useLoader(
    GLTFLoader,
    asset(`3d/tanks/models/${duel.protagonist.tank.id}.glb`),
  );

  const armorNodes = Object.values(armorGltf.nodes);
  const modelNodes = Object.values(modelGltf.nodes);
  const tankModelDefinition = awaitedModelDefinitions[duel.protagonist.tank.id];
  const turretModelDefinition =
    tankModelDefinition.turrets[duel.protagonist.turret.id];
  const gunModelDefinition =
    turretModelDefinition.guns[duel.protagonist.gun.id];
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

        if (
          !isVisible ||
          thickness === undefined ||
          (spaced && !showSpacedArmor)
        )
          return null;

        return (
          <ArmorMeshSpacedArmorDepth
            exclude
            key={node.uuid}
            geometry={(node as Mesh).geometry}
          />
        );
      })}

      {modelNodes.map((node) => {
        const isWheel = node.name.startsWith('chassis_wheel_');
        const isTrack = node.name.startsWith('chassis_track_');
        const isVisible = isWheel || isTrack;

        if (!isVisible || !showSpacedArmor) return null;

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

          if (
            !isVisible ||
            thickness === undefined ||
            (spaced && !showSpacedArmor)
          )
            return null;

          return (
            <ArmorMeshSpacedArmorDepth
              exclude
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

            if (
              !isVisible ||
              thickness === undefined ||
              (spaced && !showSpacedArmor)
            )
              return null;

            return (
              <ArmorMeshSpacedArmorDepth
                exclude
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

            if (!isVisible || !showSpacedArmor) return null;

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

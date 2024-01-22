import { ThreeEvent, useThree } from '@react-three/fiber';
import { memo, useEffect, useRef, useState } from 'react';
import {
  Euler,
  Group,
  Mesh,
  MeshStandardMaterial,
  Vector2,
  Vector3,
} from 'three';
import { degToRad } from 'three/src/math/MathUtils';
import { I_HAT, J_HAT, K_HAT } from '../../../../../../../constants/axis';
import { applyPitchYawLimits } from '../../../../../../../core/blitz/applyPitchYawLimits';
import {
  ModelDefinitions,
  modelDefinitions,
} from '../../../../../../../core/blitzkrieg/modelDefinitions';
import {
  ModelTransformEventData,
  modelTransformEvent,
} from '../../../../../../../core/blitzkrieg/modelTransform';
import { resolveJsxTree } from '../../../../../../../core/blitzkrieg/resolveJsxTree';
import { normalizeAnglePI } from '../../../../../../../core/math/normalizeAngle180';
import { useModel } from '../../../../../../../hooks/useModel';
import mutateTankopediaPersistent, {
  mutateTankopediaTemporary,
  useTankopediaTemporary,
} from '../../../../../../../stores/tankopedia';
import { Duel } from '../../../page';

interface TankModelProps {
  duel: Duel;
}

export const TankModel = memo(({ duel: { protagonist } }: TankModelProps) => {
  const [awaitedModelDefinitions, setAwaitedModelDefinitions] = useState<
    ModelDefinitions | undefined
  >(undefined);

  const canvas = useThree((state) => state.gl.domElement);
  const physical = useTankopediaTemporary((state) => state.model.pose);
  const hullContainer = useRef<Group>(null);
  const turretContainer = useRef<Group>(null);
  const gunContainer = useRef<Group>(null);

  useEffect(() => {
    (async () => {
      setAwaitedModelDefinitions(await modelDefinitions);
    })();
  }, []);

  useEffect(() => {
    if (!awaitedModelDefinitions) return;

    const hullOrigin = new Vector3(
      tankModelDefinition.hullOrigin[0],
      tankModelDefinition.hullOrigin[1],
      -tankModelDefinition.hullOrigin[2],
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

    modelTransformEvent.on(handleModelTransform);

    return () => {
      modelTransformEvent.off(handleModelTransform);
    };
  });

  if (!awaitedModelDefinitions) return;

  const tankModelDefinition = awaitedModelDefinitions[protagonist.tank.id];
  const turretModelDefinition =
    tankModelDefinition.turrets[protagonist.turret.id];
  const gunModelDefinition = turretModelDefinition.guns[protagonist.gun.id];

  const { gltf } = useModel(protagonist.tank.id);
  const nodes = Object.values(gltf.nodes);

  return (
    <group ref={hullContainer} rotation={[-Math.PI / 2, 0, 0]}>
      {nodes.map((node) => {
        const isHull = node.name === 'hull';
        const isWheel = node.name.startsWith('chassis_wheel_');
        const isTrack = node.name.startsWith('chassis_track_');
        const isVisible = isHull || isWheel || isTrack;

        function handlePointerDown(event: ThreeEvent<PointerEvent>) {
          event.stopPropagation();

          if (isTrack) {
            mutateTankopediaPersistent((draft) => {
              draft.model.visual.controlsEnabled = false;
            });

            window.addEventListener('pointermove', handlePointerMove);
            window.addEventListener('pointerup', handlePointerUp);
          }
        }
        function handlePointerMove(event: PointerEvent) {
          const mesh = node as Mesh;
          const material = mesh.material as MeshStandardMaterial;
          const offset = new Vector2(
            0,
            event.movementY * (6 / canvas.height) +
              event.movementX * (6 / canvas.width),
          );

          material.map?.offset.add(offset);
          material.roughnessMap?.offset.add(offset);
          material.normalMap?.offset.add(offset);
        }
        function handlePointerUp() {
          mutateTankopediaPersistent((draft) => {
            draft.model.visual.controlsEnabled = true;
          });
          window.removeEventListener('pointermove', handlePointerMove);
          window.removeEventListener('pointerup', handlePointerUp);
        }

        if (!isVisible) return null;

        return (
          <mesh
            children={resolveJsxTree(node)}
            key={node.uuid}
            castShadow
            receiveShadow
            geometry={(node as Mesh).geometry}
            material={(node as Mesh).material}
            position={node.position}
            rotation={node.rotation}
            scale={node.scale}
            onPointerDown={handlePointerDown}
          />
        );
      })}

      <group ref={turretContainer}>
        {nodes.map((node) => {
          const isTurret = node.name.startsWith('turret_');
          const isCurrentTurret =
            node.name ===
            `turret_${turretModelDefinition.model.toString().padStart(2, '0')}`;
          const isVisible = isCurrentTurret;
          let pitch = 0;
          let yaw = 0;

          function handlePointerDown(event: ThreeEvent<PointerEvent>) {
            event.stopPropagation();

            if (isTurret) {
              yaw = physical.yaw;
              pitch = physical.pitch;

              mutateTankopediaPersistent((draft) => {
                draft.model.visual.controlsEnabled = false;
              });
              window.addEventListener('pointermove', handlePointerMove);
              window.addEventListener('pointerup', handlePointerUp);
            }
          }
          function handlePointerMove(event: PointerEvent) {
            [pitch, yaw] = applyPitchYawLimits(
              pitch,
              yaw + event.movementX * (Math.PI / canvas.width),
              gunModelDefinition.pitch,
              turretModelDefinition.yaw,
            );
            modelTransformEvent.emit({ pitch, yaw });
          }
          function handlePointerUp() {
            mutateTankopediaTemporary((draft) => {
              draft.model.pose.pitch = normalizeAnglePI(pitch);
              draft.model.pose.yaw = normalizeAnglePI(yaw);
            });
            mutateTankopediaPersistent((draft) => {
              draft.model.visual.controlsEnabled = true;
            });
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
          }

          if (!isVisible) return null;

          return (
            <mesh
              visible={isVisible}
              onPointerDown={handlePointerDown}
              children={resolveJsxTree(node)}
              key={node.uuid}
              castShadow
              receiveShadow
              geometry={(node as Mesh).geometry}
              material={(node as Mesh).material}
              position={node.position}
              rotation={node.rotation}
              scale={node.scale}
            />
          );
        })}

        <group ref={gunContainer}>
          {nodes.map((node) => {
            const isCurrentMantlet =
              node.name ===
              `gun_${gunModelDefinition.model
                .toString()
                .padStart(2, '0')}_mask`;
            const isCurrentGun =
              node.name ===
              `gun_${gunModelDefinition.model.toString().padStart(2, '0')}`;
            const isVisible = isCurrentGun || isCurrentMantlet;
            let pitch = 0;
            let yaw = 0;

            function handlePointerDown(event: ThreeEvent<PointerEvent>) {
              event.stopPropagation();

              mutateTankopediaPersistent((draft) => {
                draft.model.visual.controlsEnabled = false;
              });
              pitch = physical.pitch;
              yaw = physical.yaw;
              window.addEventListener('pointermove', handlePointerMove);
              window.addEventListener('pointerup', handlePointerUp);
            }
            function handlePointerMove(event: PointerEvent) {
              [pitch, yaw] = applyPitchYawLimits(
                pitch - event.movementY * (Math.PI / canvas.height),
                yaw + event.movementX * (Math.PI / canvas.width),
                gunModelDefinition.pitch,
                turretModelDefinition.yaw,
              );
              modelTransformEvent.emit({ pitch, yaw });
            }
            function handlePointerUp() {
              mutateTankopediaPersistent((draft) => {
                draft.model.visual.controlsEnabled = true;
              });
              mutateTankopediaTemporary((draft) => {
                draft.model.pose.pitch = normalizeAnglePI(pitch);
                draft.model.pose.yaw = normalizeAnglePI(yaw);
              });
              window.removeEventListener('pointermove', handlePointerMove);
              window.removeEventListener('pointerup', handlePointerUp);
            }

            if (!isVisible) return null;

            return (
              <mesh
                visible={isVisible}
                onPointerDown={handlePointerDown}
                children={resolveJsxTree(node)}
                key={node.uuid}
                castShadow
                receiveShadow
                geometry={(node as Mesh).geometry}
                material={(node as Mesh).material}
                position={node.position}
                rotation={node.rotation}
                scale={node.scale}
              />
            );
          })}
        </group>
      </group>
    </group>
  );
});

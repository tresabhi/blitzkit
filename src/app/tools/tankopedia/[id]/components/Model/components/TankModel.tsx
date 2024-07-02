import { ThreeEvent, useThree } from '@react-three/fiber';
import { memo, useEffect, useRef } from 'react';
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
import { hasEquipment } from '../../../../../../../core/blitzkit/hasEquipment';
import { jsxTree } from '../../../../../../../core/blitzkit/jsxTree';
import { modelDefinitions } from '../../../../../../../core/blitzkit/modelDefinitions';
import {
  ModelTransformEventData,
  modelTransformEvent,
} from '../../../../../../../core/blitzkit/modelTransform';
import { normalizeAngleRad } from '../../../../../../../core/math/normalizeAngleRad';
import { useAwait } from '../../../../../../../hooks/useAwait';
import { useModel } from '../../../../../../../hooks/useModel';
import { mutateDuel, useDuel } from '../../../../../../../stores/duel';
import { mutateTankopediaTemporary } from '../../../../../../../stores/tankopedia';

export const TankModel = memo(() => {
  const awaitedModelDefinitions = useAwait(modelDefinitions);
  const protagonist = useDuel((draft) => draft.protagonist!);
  const canvas = useThree((state) => state.gl.domElement);
  const hullContainer = useRef<Group>(null);
  const turretContainer = useRef<Group>(null);
  const gunContainer = useRef<Group>(null);

  useEffect(() => {
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

    handleModelTransform(protagonist);
    modelTransformEvent.on(handleModelTransform);

    return () => {
      modelTransformEvent.off(handleModelTransform);
    };
  });

  if (!awaitedModelDefinitions) return;

  const tankModelDefinition = awaitedModelDefinitions[protagonist.tank.id];
  const trackModelDefinition = tankModelDefinition.tracks[protagonist.track.id];
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
        const position = new Vector2();
        const delta = new Vector2();

        if (!isVisible) return null;

        function translateTexture(offset: number) {
          const mesh = node.children[0] as Mesh;
          const material = mesh?.material as MeshStandardMaterial;

          if (!material) return;

          if (material.map) material.map.offset.y += offset;
          if (material.aoMap) material.aoMap.offset.y += offset;
          if (material.normalMap) material.normalMap.offset.y += offset;
          if (material.roughnessMap) material.roughnessMap.offset.y += offset;
          if (material.metalnessMap) material.metalnessMap.offset.y += offset;
        }

        function onPointerDown(event: ThreeEvent<PointerEvent>) {
          if (!isTrack) return;

          position.set(event.clientX, event.clientY);
          event.stopPropagation();

          mutateTankopediaTemporary((draft) => {
            draft.controlsEnabled = false;
          });

          window.addEventListener('pointermove', handlePointerMove);
          window.addEventListener('pointerup', handlePointerUp);
        }
        function handlePointerMove(event: PointerEvent) {
          delta.set(event.clientX, event.clientY).sub(position);
          position.set(event.clientX, event.clientY);
          const deltaX = delta.x / window.innerWidth;
          const deltaY = delta.y / window.innerHeight;

          translateTexture(deltaX + deltaY);
        }
        function handlePointerUp() {
          mutateTankopediaTemporary((draft) => {
            draft.controlsEnabled = true;
          });

          window.removeEventListener('pointermove', handlePointerMove);
          window.removeEventListener('pointerup', handlePointerUp);
        }

        return jsxTree(
          node,
          {
            castShadow: true,
            receiveShadow: true,
            onPointerDown,
          },
          node.uuid,
        );
      })}

      <group ref={turretContainer}>
        {nodes.map((node) => {
          const isTurret = node.name.startsWith('turret_');
          const isCurrentTurret =
            node.name ===
            `turret_${turretModelDefinition.model.toString().padStart(2, '0')}`;
          const isVisible = isCurrentTurret;
          const position = new Vector2();
          const delta = new Vector2();

          if (!isVisible) return null;

          let pitch = 0;
          let yaw = 0;

          function onPointerDown(event: ThreeEvent<PointerEvent>) {
            event.stopPropagation();

            if (isTurret) {
              position.set(event.clientX, event.clientY);
              yaw = protagonist.yaw;
              pitch = protagonist.pitch;

              mutateTankopediaTemporary((draft) => {
                draft.controlsEnabled = false;
              });
              mutateTankopediaTemporary((draft) => {
                draft.shot = undefined;
              });
              window.addEventListener('pointermove', handlePointerMove);
              window.addEventListener('pointerup', handlePointerUp);
            }
          }
          async function handlePointerMove(event: PointerEvent) {
            const duel = useDuel.getState();
            const hasImprovedVerticalStabilizer = await hasEquipment(
              122,
              duel.protagonist!.tank.equipment,
              duel.protagonist!.equipmentMatrix,
            );
            const boundingRect = canvas.getBoundingClientRect();

            delta.set(event.clientX, event.clientY).sub(position);
            position.set(event.clientX, event.clientY);

            [pitch, yaw] = applyPitchYawLimits(
              pitch,
              yaw + delta.x * (Math.PI / boundingRect.width),
              gunModelDefinition.pitch,
              turretModelDefinition.yaw,
              hasImprovedVerticalStabilizer,
            );
            modelTransformEvent.emit({ pitch, yaw });
          }
          function handlePointerUp() {
            mutateDuel((draft) => {
              draft.protagonist!.pitch = normalizeAngleRad(pitch);
              draft.protagonist!.yaw = normalizeAngleRad(yaw);
            });
            mutateTankopediaTemporary((draft) => {
              draft.controlsEnabled = true;
            });
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
          }

          return jsxTree(
            node,
            {
              castShadow: true,
              receiveShadow: true,
              onPointerDown,
            },
            node.uuid,
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
            const position = new Vector2();
            const delta = new Vector2();

            if (!isVisible) return null;

            let pitch = 0;
            let yaw = 0;

            function onPointerDown(event: ThreeEvent<PointerEvent>) {
              event.stopPropagation();

              mutateTankopediaTemporary((draft) => {
                draft.controlsEnabled = false;
              });
              mutateTankopediaTemporary((draft) => {
                draft.shot = undefined;
              });

              position.set(event.clientX, event.clientY);
              pitch = protagonist.pitch;
              yaw = protagonist.yaw;

              window.addEventListener('pointermove', handlePointerMove);
              window.addEventListener('pointerup', handlePointerUp);
            }
            async function handlePointerMove(event: PointerEvent) {
              const duel = useDuel.getState();
              const hasImprovedVerticalStabilizer = await hasEquipment(
                122,
                duel.protagonist!.tank.equipment,
                duel.protagonist!.equipmentMatrix,
              );
              const boundingRect = canvas.getBoundingClientRect();
              delta.set(event.clientX, event.clientY).sub(position);
              position.set(event.clientX, event.clientY);

              [pitch, yaw] = applyPitchYawLimits(
                pitch - delta.y * (Math.PI / boundingRect.height),
                yaw + delta.x * (Math.PI / boundingRect.width),
                gunModelDefinition.pitch,
                turretModelDefinition.yaw,
                hasImprovedVerticalStabilizer,
              );
              modelTransformEvent.emit({ pitch, yaw });
            }
            function handlePointerUp() {
              mutateTankopediaTemporary((draft) => {
                draft.controlsEnabled = true;
              });
              mutateDuel((draft) => {
                draft.protagonist!.pitch = normalizeAngleRad(pitch);
                draft.protagonist!.yaw = normalizeAngleRad(yaw);
              });
              window.removeEventListener('pointermove', handlePointerMove);
              window.removeEventListener('pointerup', handlePointerUp);
            }

            return jsxTree(
              node,
              {
                castShadow: true,
                receiveShadow: true,
                onPointerDown,
              },
              node.uuid,
            );
          })}
        </group>
      </group>
    </group>
  );
});

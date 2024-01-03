import { ThreeEvent, useThree } from '@react-three/fiber';
import { clamp } from 'lodash';
import { RefObject, useRef } from 'react';
import { Group, Mesh, Object3D, Vector3 } from 'three';
import {
  PitchLimits,
  YawLimits,
} from '../../../../../core/blitzkrieg/modelDefinitions';
import { resolveJsxTree } from '../../../../../core/blitzkrieg/resolveJsxTree';
import { normalizeAnglePI } from '../../../../../core/math/normalizeAngle180';

interface GunContainerProps {
  turretOrigin: Vector3;
  gunOrigin: Vector3;
  gunPitch: number;
  turretYaw: number;
  objects: Object3D[];
  model: number;
  yawLimits?: YawLimits;
  pitchLimits: PitchLimits;
  onPitchStart: () => void;
  onPitchEnd: (pitch: number, yaw: number) => void;
  turretContainer: RefObject<Group>;
}

export function GunContainer({
  gunOrigin,
  turretOrigin,
  gunPitch,
  turretYaw,
  objects,
  yawLimits,
  onPitchStart,
  turretContainer,
  pitchLimits,
  model,
  onPitchEnd,
}: GunContainerProps) {
  const canvas = useThree((state) => state.gl.domElement);
  const gunContainer = useRef<Group>(null);

  return (
    <group
      position={new Vector3()
        .sub(turretOrigin)
        .sub(gunOrigin)
        .applyAxisAngle(new Vector3(1, 0, 0), gunPitch)
        .add(turretOrigin)
        .add(gunOrigin)}
      rotation={[gunPitch, 0, 0]}
      ref={gunContainer}
    >
      {objects.map((object) => {
        const isCurrentMantlet =
          object.name === `gun_${model.toString().padStart(2, '0')}_mask`;
        const isCurrentGun =
          object.name === `gun_${model.toString().padStart(2, '0')}`;
        const isVisible = isCurrentGun || isCurrentMantlet;
        let draftMantletPitch = 0;
        let draftTurretYaw = 0;

        function handlePointerDown(event: ThreeEvent<PointerEvent>) {
          event.stopPropagation();

          onPitchStart();
          draftMantletPitch = gunPitch;
          draftTurretYaw = turretYaw;
          window.addEventListener('pointermove', handlePointerMove);
          window.addEventListener('pointerup', handlePointerUp);
        }
        function handlePointerMove(event: PointerEvent) {
          if (yawLimits) {
            draftTurretYaw = clamp(
              draftTurretYaw + event.movementX * (Math.PI / canvas.width),
              -yawLimits.max * (Math.PI / 180),
              -yawLimits.min * (Math.PI / 180),
            );
          } else {
            draftTurretYaw += event.movementX * ((2 * Math.PI) / canvas.width);
          }
          draftMantletPitch = clamp(
            draftMantletPitch - event.movementY * (Math.PI / canvas.height),
            -pitchLimits.max * (Math.PI / 180),
            -pitchLimits.min * (Math.PI / 180),
          );

          if (gunContainer.current) {
            gunContainer.current.position
              .set(0, 0, 0)
              .sub(turretOrigin)
              .sub(gunOrigin)
              .applyAxisAngle(new Vector3(1, 0, 0), draftMantletPitch)
              .add(turretOrigin)
              .add(gunOrigin);
            gunContainer.current.rotation.x = draftMantletPitch;
          }

          if (turretContainer.current) {
            turretContainer.current.position
              .set(0, 0, 0)
              .sub(turretOrigin)
              .applyAxisAngle(new Vector3(0, 0, 1), draftTurretYaw)
              .add(turretOrigin);
            turretContainer.current.rotation.z = draftTurretYaw;
          }
        }
        function handlePointerUp() {
          onPitchEnd(
            normalizeAnglePI(draftMantletPitch),
            normalizeAnglePI(draftTurretYaw),
          );
          window.removeEventListener('pointermove', handlePointerMove);
          window.removeEventListener('pointerup', handlePointerUp);
        }

        if (!isVisible) return null;
        return (
          <mesh
            visible={isVisible}
            onPointerDown={handlePointerDown}
            children={resolveJsxTree(object)}
            key={object.uuid}
            castShadow
            receiveShadow
            geometry={(object as Mesh).geometry}
            material={(object as Mesh).material}
            position={object.position}
            rotation={object.rotation}
            scale={object.scale}
          />
        );
      })}
    </group>
  );
}

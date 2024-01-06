import { ThreeEvent, useThree } from '@react-three/fiber';
import { RefObject, forwardRef, useImperativeHandle, useRef } from 'react';
import { Group, Mesh, Object3D, Vector3 } from 'three';
import { applyPitchYawLimits } from '../../../../../core/blitz/applyPitchYawLimits';
import {
  InitialTurretRotation,
  PitchLimits,
  YawLimits,
} from '../../../../../core/blitzkrieg/modelDefinitions';
import { resolveJsxTree } from '../../../../../core/blitzkrieg/resolveJsxTree';
import { normalizeAnglePI } from '../../../../../core/math/normalizeAngle180';

interface GunContainerProps {
  turretOrigin: Vector3;
  gunOrigin: Vector3;
  pitch: number;
  yaw: number;
  objects: Object3D[];
  model: number;
  yawLimits?: YawLimits;
  pitchLimits: PitchLimits;
  onPitchStart: () => void;
  onPitchEnd: (pitch: number, yaw: number) => void;
  initialTurretRotation?: InitialTurretRotation;
  turretContainer: RefObject<Group>;
}

export const GunContainer = forwardRef<Group, GunContainerProps>(
  (
    {
      gunOrigin,
      turretOrigin,
      pitch,
      initialTurretRotation,
      yaw,
      objects,
      yawLimits,
      onPitchStart,
      turretContainer,
      pitchLimits,
      model,
      onPitchEnd,
    }: GunContainerProps,
    ref,
  ) => {
    const canvas = useThree((state) => state.gl.domElement);
    const gunContainer = useRef<Group>(null);

    useImperativeHandle(ref, () => gunContainer.current!);

    return (
      <group
        position={new Vector3()
          .sub(turretOrigin)
          .sub(gunOrigin)
          .applyAxisAngle(new Vector3(1, 0, 0), pitch)
          .add(turretOrigin)
          .add(gunOrigin)}
        rotation={[pitch, 0, 0]}
        ref={gunContainer}
      >
        {objects.map((object) => {
          const isCurrentMantlet =
            object.name === `gun_${model.toString().padStart(2, '0')}_mask`;
          const isCurrentGun =
            object.name === `gun_${model.toString().padStart(2, '0')}`;
          const isVisible = isCurrentGun || isCurrentMantlet;
          let draftPitch = 0;
          let draftYaw = 0;

          function handlePointerDown(event: ThreeEvent<PointerEvent>) {
            event.stopPropagation();

            onPitchStart();
            draftPitch = pitch;
            draftYaw = yaw;
            window.addEventListener('pointermove', handlePointerMove);
            window.addEventListener('pointerup', handlePointerUp);
          }
          function handlePointerMove(event: PointerEvent) {
            [draftPitch, draftYaw] = applyPitchYawLimits(
              draftPitch - event.movementY * (Math.PI / canvas.height),
              draftYaw + event.movementX * (Math.PI / canvas.width),
              pitchLimits,
              yawLimits,
            );

            if (gunContainer.current) {
              gunContainer.current.position
                .set(0, 0, 0)
                .sub(turretOrigin)
                .sub(gunOrigin)
                .applyAxisAngle(new Vector3(1, 0, 0), draftPitch)
                .add(turretOrigin)
                .add(gunOrigin);
              gunContainer.current.rotation.x = draftPitch;
            }

            if (turretContainer.current) {
              turretContainer.current.position
                .set(0, 0, 0)
                .sub(turretOrigin)
                .applyAxisAngle(new Vector3(0, 0, 1), draftYaw);
              turretContainer.current.rotation.z = draftYaw;

              if (initialTurretRotation) {
                const pitch = -initialTurretRotation.pitch * (Math.PI / 180);
                const yaw = -initialTurretRotation.yaw * (Math.PI / 180);
                const roll = -initialTurretRotation.roll * (Math.PI / 180);

                turretContainer.current.position
                  .applyAxisAngle(new Vector3(1, 0, 0), pitch)
                  .applyAxisAngle(new Vector3(0, 1, 0), roll)
                  .applyAxisAngle(new Vector3(0, 0, 1), yaw);
              }

              turretContainer.current.position.add(turretOrigin);
            }
          }
          function handlePointerUp() {
            onPitchEnd(
              normalizeAnglePI(draftPitch),
              normalizeAnglePI(draftYaw),
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
  },
);

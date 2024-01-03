import { ThreeEvent, useThree } from '@react-three/fiber';
import { clamp } from 'lodash';
import { RefObject, forwardRef, useImperativeHandle, useRef } from 'react';
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
  pitch: number;
  yaw: number;
  objects: Object3D[];
  model: number;
  yawLimits?: YawLimits;
  pitchLimits: PitchLimits;
  onPitchStart: () => void;
  onPitchEnd: (pitch: number, yaw: number) => void;
  turretContainer: RefObject<Group>;
}

export const GunContainer = forwardRef<Group, GunContainerProps>(
  (
    {
      gunOrigin,
      turretOrigin,
      pitch,
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
            if (yawLimits) {
              draftYaw = clamp(
                draftYaw + event.movementX * (Math.PI / canvas.width),
                -yawLimits.max * (Math.PI / 180),
                -yawLimits.min * (Math.PI / 180),
              );
            } else {
              draftYaw += event.movementX * ((2 * Math.PI) / canvas.width);
            }

            let lowerPitch = -pitchLimits.max * (Math.PI / 180);
            let upperPitch = -pitchLimits.min * (Math.PI / 180);
            const transition = (pitchLimits.transition ?? 10) * (Math.PI / 180);

            if (pitchLimits.back) {
              const range = pitchLimits.back.range * (Math.PI / 180);
              const yawRotatedAbs = Math.abs(
                normalizeAnglePI(draftYaw - Math.PI),
              );

              if (yawRotatedAbs <= range + transition) {
                if (yawRotatedAbs <= range) {
                  // inside range
                  lowerPitch = -pitchLimits.back.max * (Math.PI / 180);
                  upperPitch = -pitchLimits.back.min * (Math.PI / 180);
                } else {
                  // inside transition
                  const transitionProgress =
                    (yawRotatedAbs - range) / transition;
                  const maxInterpolatedPitch =
                    (1 - transitionProgress) * pitchLimits.back.max +
                    transitionProgress * pitchLimits.max;
                  const minInterpolatedPitch =
                    (1 - transitionProgress) * pitchLimits.back.min +
                    transitionProgress * pitchLimits.min;

                  lowerPitch = -maxInterpolatedPitch * (Math.PI / 180);
                  upperPitch = -minInterpolatedPitch * (Math.PI / 180);
                }
              }
            }

            if (pitchLimits.front) {
              const range = pitchLimits.front.range * (Math.PI / 180);
              const yawAbs = Math.abs(normalizeAnglePI(draftYaw));

              if (yawAbs <= range + transition) {
                if (yawAbs <= range) {
                  // inside range
                  lowerPitch = -pitchLimits.front.max * (Math.PI / 180);
                  upperPitch = -pitchLimits.front.min * (Math.PI / 180);
                } else {
                  // inside transition
                  const transitionProgress = (yawAbs - range) / transition;
                  const maxInterpolatedPitch =
                    (1 - transitionProgress) * pitchLimits.front.max +
                    transitionProgress * pitchLimits.max;
                  const minInterpolatedPitch =
                    (1 - transitionProgress) * pitchLimits.front.min +
                    transitionProgress * pitchLimits.min;

                  lowerPitch = -maxInterpolatedPitch * (Math.PI / 180);
                  upperPitch = -minInterpolatedPitch * (Math.PI / 180);
                }
              }
            }

            draftPitch = clamp(
              draftPitch - event.movementY * (Math.PI / canvas.height),
              lowerPitch,
              upperPitch,
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
                .applyAxisAngle(new Vector3(0, 0, 1), draftYaw)
                .add(turretOrigin);
              turretContainer.current.rotation.z = draftYaw;
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

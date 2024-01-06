import { ThreeEvent, useThree } from '@react-three/fiber';
import {
  ReactNode,
  RefObject,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react';
import { Euler, Group, Mesh, Object3D, Vector3 } from 'three';
import { applyPitchYawLimits } from '../../../../../core/blitz/applyPitchYawLimits';
import {
  InitialTurretRotation,
  PitchLimits,
  YawLimits,
} from '../../../../../core/blitzkrieg/modelDefinitions';
import { resolveJsxTree } from '../../../../../core/blitzkrieg/resolveJsxTree';
import { normalizeAnglePI } from '../../../../../core/math/normalizeAngle180';

interface TurretContainerProps {
  turretOrigin: Vector3;
  gunOrigin: Vector3;
  objects: Object3D[];
  children: ReactNode;
  yaw: number;
  pitch: number;
  model: number;
  yawLimits?: YawLimits;
  pitchLimits: PitchLimits;
  onYawStart: () => void;
  onYawEnd: (pitch: number, yaw: number) => void;
  gunContainer: RefObject<Group>;
  initialTurretRotation?: InitialTurretRotation;
}

export const TurretContainer = forwardRef(
  (
    {
      gunContainer,
      turretOrigin,
      yaw,
      children,
      objects,
      yawLimits,
      model,
      onYawEnd,
      pitch,
      gunOrigin,
      pitchLimits,
      onYawStart,
      initialTurretRotation,
    }: TurretContainerProps,
    ref,
  ) => {
    const canvas = useThree((state) => state.gl.domElement);
    const turretContainer = useRef<Group>(null);
    const position = new Vector3()
      .sub(turretOrigin)
      .applyAxisAngle(new Vector3(0, 0, 1), yaw);
    const rotation = new Euler(0, 0, yaw);

    if (initialTurretRotation) {
      const pitch = -initialTurretRotation.pitch * (Math.PI / 180);
      const yaw = -initialTurretRotation.yaw * (Math.PI / 180);
      const roll = -initialTurretRotation.roll * (Math.PI / 180);

      position
        .applyAxisAngle(new Vector3(1, 0, 0), pitch)
        .applyAxisAngle(new Vector3(0, 1, 0), roll)
        .applyAxisAngle(new Vector3(0, 0, 1), yaw);
      rotation.x += pitch;
      rotation.y += roll;
      rotation.z += yaw;
    }

    position.add(turretOrigin);

    useImperativeHandle(ref, () => turretContainer.current!);

    return (
      <group position={position} rotation={rotation} ref={turretContainer}>
        {objects.map((object) => {
          const isTurret = object.name.startsWith('turret_');
          const isCurrentTurret =
            object.name === `turret_${model.toString().padStart(2, '0')}`;
          const isVisible = isCurrentTurret;
          let draftPitch = 0;
          let draftYaw = 0;

          function handlePointerDown(event: ThreeEvent<PointerEvent>) {
            event.stopPropagation();

            if (isTurret) {
              draftYaw = yaw;
              draftPitch = pitch;

              onYawStart();
              window.addEventListener('pointermove', handlePointerMove);
              window.addEventListener('pointerup', handlePointerUp);
            }
          }
          function handlePointerMove(event: PointerEvent) {
            [draftPitch, draftYaw] = applyPitchYawLimits(
              draftPitch,
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
            onYawEnd(normalizeAnglePI(draftPitch), normalizeAnglePI(draftYaw));
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

        {children}
      </group>
    );
  },
);

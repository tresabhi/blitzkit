import { ThreeEvent, useThree } from '@react-three/fiber';
import { ReactNode, forwardRef, useImperativeHandle, useRef } from 'react';
import { Group, Mesh, Object3D, Vector3 } from 'three';
import { resolveJsxTree } from '../../../../../core/blitzkrieg/resolveJsxTree';
import { normalizeAnglePI } from '../../../../../core/math/normalizeAngle180';

interface TurretContainerProps {
  origin: Vector3;
  objects: Object3D[];
  children: ReactNode;
  yaw: number;
  model: number;
  onYawStart: () => void;
  onYawEnd: (yaw: number) => void;
}

export const TurretContainer = forwardRef(
  (
    {
      origin,
      yaw,
      children,
      objects,
      model,
      onYawEnd,
      onYawStart,
    }: TurretContainerProps,
    ref,
  ) => {
    const canvas = useThree((state) => state.gl.domElement);
    const turretContainer = useRef<Group>(null);

    useImperativeHandle(ref, () => turretContainer.current!);

    return (
      <group
        position={new Vector3()
          .sub(origin)
          .applyAxisAngle(new Vector3(0, 0, 1), yaw)
          .add(origin)}
        rotation={[0, 0, yaw]}
        ref={turretContainer}
      >
        {objects.map((object) => {
          const isTurret = object.name.startsWith('turret_');
          const isCurrentTurret =
            object.name === `turret_${model.toString().padStart(2, '0')}`;
          const isVisible = isCurrentTurret;
          let draftYaw = 0;

          function handlePointerDown(event: ThreeEvent<PointerEvent>) {
            event.stopPropagation();

            if (isTurret) {
              draftYaw = yaw;

              onYawStart();
              window.addEventListener('pointermove', handlePointerMove);
              window.addEventListener('pointerup', handlePointerUp);
            }
          }
          function handlePointerMove(event: PointerEvent) {
            draftYaw += event.movementX * ((2 * Math.PI) / canvas.width);

            if (turretContainer.current) {
              turretContainer.current.position
                .set(0, 0, 0)
                .sub(origin)
                .applyAxisAngle(new Vector3(0, 0, 1), draftYaw)
                .add(origin);
              turretContainer.current.rotation.z = draftYaw;
            }
          }
          function handlePointerUp() {
            onYawEnd(normalizeAnglePI(draftYaw));
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

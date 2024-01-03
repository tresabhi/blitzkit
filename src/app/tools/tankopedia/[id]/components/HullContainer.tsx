import { ThreeEvent, useThree } from '@react-three/fiber';
import { ReactNode, forwardRef, useImperativeHandle, useRef } from 'react';
import { Group, Mesh, Object3D } from 'three';
import { resolveJsxTree } from '../../../../../core/blitzkrieg/resolveJsxTree';
import { normalizeAnglePI } from '../../../../../core/math/normalizeAngle180';

interface HullContainerProps {
  children: ReactNode;
  yaw: number;
  objects: Object3D[];
  onYawStart: () => void;
  onYawEnd: (yaw: number) => void;
}

export const HullContainer = forwardRef<Group, HullContainerProps>(
  ({ children, yaw, objects, onYawStart, onYawEnd }, ref) => {
    const canvas = useThree((state) => state.gl.domElement);
    const hullContainer = useRef<Group>(null);

    useImperativeHandle(ref, () => hullContainer.current!);

    return (
      <group ref={hullContainer} rotation={[-Math.PI / 2, 0, yaw]}>
        {objects.map((object) => {
          const isHull = object.name === 'hull';
          const isWheel = object.name.startsWith('chassis_wheel_');
          const isTrack = object.name.startsWith('chassis_track_');
          const isVisible = isHull || isWheel || isTrack;
          let draftHullYaw = 0;

          function handlePointerDown(event: ThreeEvent<PointerEvent>) {
            event.stopPropagation();

            draftHullYaw = yaw;

            onYawStart();
            window.addEventListener('pointermove', handlePointerMove);
            window.addEventListener('pointerup', handlePointerUp);
          }
          function handlePointerMove(event: PointerEvent) {
            draftHullYaw += event.movementX * ((2 * Math.PI) / canvas.width);

            if (hullContainer.current) {
              hullContainer.current.rotation.z = draftHullYaw;
            }
          }
          function handlePointerUp() {
            onYawEnd(normalizeAnglePI(draftHullYaw));
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
          }

          if (!isVisible) return null;
          return (
            <mesh
              children={resolveJsxTree(object)}
              key={object.uuid}
              castShadow
              receiveShadow
              geometry={(object as Mesh).geometry}
              material={(object as Mesh).material}
              position={object.position}
              rotation={object.rotation}
              scale={object.scale}
              onPointerDown={handlePointerDown}
            />
          );
        })}

        {children}
      </group>
    );
  },
);

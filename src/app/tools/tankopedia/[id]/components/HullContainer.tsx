import { ThreeEvent, useThree } from '@react-three/fiber';
import { ReactNode, forwardRef, useImperativeHandle, useRef } from 'react';
import { Group, Mesh, MeshStandardMaterial, Object3D, Vector2 } from 'three';
import { resolveJsxTree } from '../../../../../core/blitzkrieg/resolveJsxTree';
import { normalizeAnglePI } from '../../../../../core/math/normalizeAngle180';

interface HullContainerProps {
  children: ReactNode;
  yaw: number;
  objects: Object3D[];
  onYawStart: () => void;
  onYawEnd: (yaw: number) => void;
  onTrackStart: () => void;
  onTrackEnd: () => void;
}

export const HullContainer = forwardRef<Group, HullContainerProps>(
  (
    { children, yaw, objects, onYawStart, onYawEnd, onTrackEnd, onTrackStart },
    ref,
  ) => {
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

            if (isHull) {
              draftHullYaw = yaw;

              onYawStart();
              window.addEventListener('pointermove', handlePointerMoveHull);
              window.addEventListener('pointerup', handlePointerUpHull);
            } else if (isTrack) {
              onTrackStart();
              window.addEventListener('pointermove', handlePointerMoveTrack);
              window.addEventListener('pointerup', handlePointerUpTrack);
            }
          }
          function handlePointerMoveHull(event: PointerEvent) {
            event.preventDefault();

            draftHullYaw += event.movementX * ((2 * Math.PI) / canvas.width);

            if (hullContainer.current) {
              hullContainer.current.rotation.z = draftHullYaw;
            }
          }
          function handlePointerUpHull() {
            onYawEnd(normalizeAnglePI(draftHullYaw));
            window.removeEventListener('pointermove', handlePointerMoveHull);
            window.removeEventListener('pointerup', handlePointerUpHull);
          }
          function handlePointerMoveTrack(event: PointerEvent) {
            event.preventDefault();

            const mesh = object as Mesh;
            const material = mesh.material as MeshStandardMaterial;
            const offset = new Vector2(
              0,
              -event.movementY * (6 / canvas.height) +
                event.movementX * (6 / canvas.width),
            );

            material.map?.offset.add(offset);
            material.roughnessMap?.offset.add(offset);
            material.normalMap?.offset.add(offset);
          }
          function handlePointerUpTrack() {
            onTrackEnd();
            window.removeEventListener('pointermove', handlePointerMoveTrack);
            window.removeEventListener('pointerup', handlePointerUpTrack);
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

import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { RefObject, useEffect, useRef } from 'react';
import { Box3, Group, Vector3 } from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

interface TankAlignmentProps {
  model: RefObject<Group>;
  orbit: boolean;
}

export function TankAlignment({ model, orbit }: TankAlignmentProps) {
  const controls = useRef<OrbitControlsImpl>(null);
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    const box = new Box3().setFromObject(model.current!);
    const diameter = Math.max(box.max.x - box.min.x, box.max.z - box.min.z);

    controls.current?.target.set(0, (2 * box.min.y + box.max.y) / 3, 0);
    camera.position.set(-5, (box.min.y + box.max.y) / 2, -15);
  }, []);

  return (
    <OrbitControls
      ref={controls}
      enabled={orbit}
      target={new Vector3(0, 2, 0)}
    />
  );
}

import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { RefObject, useEffect, useRef } from 'react';
import { Box3, Object3D } from 'three';
import { OrbitControls as OrbitControlsClass } from 'three-stdlib';

interface ControlsProps {
  enabled: boolean;
  fit: RefObject<Object3D>;
}

export function Controls({ enabled, fit }: ControlsProps) {
  const camera = useThree((state) => state.camera);
  const orbitControls = useRef<OrbitControlsClass>(null);

  useEffect(() => {
    const box = new Box3().setFromObject(fit.current!);

    orbitControls.current?.target.set(0, (box.min.y + box.max.y) / 2, 0);
    camera.position.set(-5, (box.min.y + box.max.y) / 2, -15);
  }, [fit.current]);

  return <OrbitControls ref={orbitControls} enabled={enabled} />;
}

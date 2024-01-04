import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { OrbitControls as OrbitControlsClass } from 'three-stdlib';
import { useTankopedia } from '../../../../../stores/tankopedia';

export function Controls() {
  const camera = useThree((state) => state.camera);
  const orbitControls = useRef<OrbitControlsClass>(null);
  const enabled = useTankopedia((state) => state.model.controlsEnabled);

  useEffect(() => {
    camera.position.set(-5, 4, -20);
    orbitControls.current?.target.set(0, 1.5, 0);
  }, []);

  return <OrbitControls ref={orbitControls} enabled={enabled} />;
}

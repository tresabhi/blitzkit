import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { OrbitControls as OrbitControlsClass } from 'three-stdlib';
import { useTankopedia } from '../../../../../stores/tankopedia';

export function Controls() {
  const camera = useThree((state) => state.camera);
  const orbitControls = useRef<OrbitControlsClass>(null);

  useEffect(() => {
    camera.position.set(-5, 4, -20);
    orbitControls.current?.target.set(0, 1.5, 0);

    const unsubscribe = useTankopedia.subscribe(
      (state) => state.model.visual.controlsEnabled,
      (enabled) => {
        if (orbitControls.current) orbitControls.current.enabled = enabled;
      },
    );

    return unsubscribe;
  }, []);

  return (
    <OrbitControls
      ref={orbitControls}
      enabled={useTankopedia.getState().model.visual.controlsEnabled}
      rotateSpeed={0.25}
      enableDamping={false}
    />
  );
}

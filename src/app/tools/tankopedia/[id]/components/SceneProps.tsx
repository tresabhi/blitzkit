import { useFrame, useLoader } from '@react-three/fiber';
import { clamp } from 'lodash';
import { useRef } from 'react';
import { MeshStandardMaterial, TextureLoader } from 'three';
import { useTankopediaPersistent } from '../../../../../stores/tankopedia';

export function SceneProps() {
  const show = useTankopediaPersistent(
    (state) =>
      state.model.visual.showGrid && !state.model.visual.showEnvironment,
  );
  const texture = useLoader(TextureLoader, 'https://i.imgur.com/C28Z8nU.png');
  const material = useRef<MeshStandardMaterial>(null);

  useFrame(({ camera }) => {
    if (!material.current) return;
    material.current.opacity = clamp(0.1 * camera.position.y, 0, 1);
  });

  texture.anisotropy = 2;

  if (!show) return null;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial ref={material} map={texture} transparent />
    </mesh>
  );
}

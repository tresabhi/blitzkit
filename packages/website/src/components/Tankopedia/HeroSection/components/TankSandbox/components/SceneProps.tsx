import { useFrame, useLoader } from '@react-three/fiber';
import { clamp } from 'lodash-es';
import { useRef } from 'react';
import { MeshStandardMaterial, TextureLoader } from 'three';
import { TankopediaPersistent } from '../../../../../../stores/tankopediaPersistent';

export function SceneProps() {
  const show = TankopediaPersistent.use(
    (state) => state.showGrid && !state.showEnvironment,
  );
  const texture = useLoader(TextureLoader, 'https://i.imgur.com/C28Z8nU.png');
  const material = useRef<MeshStandardMaterial>(null);

  useFrame(({ camera }) => {
    if (!material.current) return;
    material.current.opacity = clamp(0.5 * camera.position.y, 0, 1);
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

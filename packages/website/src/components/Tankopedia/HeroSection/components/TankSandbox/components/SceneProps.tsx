import { useFrame, useLoader } from '@react-three/fiber';
import { clamp } from 'lodash-es';
import { useRef } from 'react';
import { MeshStandardMaterial, TextureLoader } from 'three';
import { TankopediaEphemeral } from '../../../../../../stores/tankopediaEphemeral';
import { TankopediaPersistent } from '../../../../../../stores/tankopediaPersistent';
import { TankopediaDisplay } from '../../../../../../stores/tankopediaPersistent/constants';

export function SceneProps() {
  const show = TankopediaPersistent.use(
    (state) => state.showGrid && !state.showEnvironment,
  );
  const texture = useLoader(TextureLoader, 'https://i.imgur.com/C28Z8nU.png');
  const material = useRef<MeshStandardMaterial>(null);
  const display = TankopediaEphemeral.use((state) => state.display);

  useFrame(({ camera }) => {
    if (!material.current) return;
    material.current.opacity = clamp(0.5 * camera.position.y, 0, 1);
  });

  texture.anisotropy = 2;

  return (
    <>
      {show && display !== TankopediaDisplay.ShootingRange && (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial ref={material} map={texture} transparent />
        </mesh>
      )}
      {display === TankopediaDisplay.ShootingRange && (
        <>
          {/* <TransformControls>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <boxGeometry args={[1, 1, 1]} />
            </mesh>
          </TransformControls> */}
        </>
      )}
    </>
  );
}

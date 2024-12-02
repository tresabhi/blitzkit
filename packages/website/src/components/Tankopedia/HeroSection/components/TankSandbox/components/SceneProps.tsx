import { useFrame, useLoader } from '@react-three/fiber';
import { clamp } from 'lodash-es';
import { useRef } from 'react';
import {
  AxesHelper,
  Group,
  MeshStandardMaterial,
  TextureLoader,
  Vector2,
} from 'three';
import { TankopediaEphemeral } from '../../../../../../stores/tankopediaEphemeral';
import { TankopediaPersistent } from '../../../../../../stores/tankopediaPersistent';
import { TankopediaDisplay } from '../../../../../../stores/tankopediaPersistent/constants';

const emptyVector = new Vector2();

export function SceneProps() {
  const helper = useRef<AxesHelper>(null);
  const show = TankopediaPersistent.use(
    (state) => state.showGrid && !state.showEnvironment,
  );
  const texture = useLoader(TextureLoader, 'https://i.imgur.com/C28Z8nU.png');
  const material = useRef<MeshStandardMaterial>(null);
  const display = TankopediaEphemeral.use((state) => state.display);
  const playground = useRef<Group>(null);

  useFrame(({ camera }) => {
    if (!material.current) return;
    material.current.opacity = clamp(0.5 * camera.position.y, 0, 1);
  });

  texture.anisotropy = 2;

  useFrame(({ raycaster, scene, camera }) => {
    if (
      display !== TankopediaDisplay.ShootingRange ||
      !playground.current ||
      !helper.current
    ) {
      return;
    }

    raycaster.setFromCamera(emptyVector, camera);

    const intersections = raycaster.intersectObjects(
      playground.current.children,
      true,
    );

    if (intersections.length === 0) return;

    helper.current.position.copy(intersections[0].point);
  });

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
          <axesHelper ref={helper} />

          <group ref={playground}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[100, 100]} />
              <meshStandardMaterial color={0x404040} />
            </mesh>

            <mesh
              receiveShadow
              castShadow
              position={[10, 1.5, -10]}
              rotation={[0, Math.PI / 4, 0]}
            >
              <boxGeometry args={[1, 3, 1]} />
              <meshStandardMaterial color={0xff8040} />
            </mesh>
          </group>
        </>
      )}
    </>
  );
}

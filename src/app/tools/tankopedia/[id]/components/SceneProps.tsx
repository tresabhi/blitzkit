import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { useTankopediaPersistent } from '../../../../../stores/tankopedia';

export function SceneProps() {
  const show = useTankopediaPersistent(
    (state) =>
      state.model.visual.showGrid && !state.model.visual.showEnvironment,
  );
  const texture = useLoader(TextureLoader, 'https://i.imgur.com/6QjSn1e.png');

  if (!show) return null;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[10, 10]} />
      <meshBasicMaterial map={texture} transparent />
    </mesh>
  );
}

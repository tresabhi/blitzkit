import { Color } from 'three';
import InfiniteGridHelper from '../../../../../components/InfiniteGridHelper';

export function SceneProps() {
  return (
    <>
      <InfiniteGridHelper
        size1={1 / 5}
        size2={1}
        distance={20}
        color={new Color('#ffffff')}
      />
      <InfiniteGridHelper
        position={[0, 1e-4, 0]}
        size1={0}
        size2={100}
        distance={25}
        color={new Color('red')}
      />

      <directionalLight position={[1, 1, -1]} intensity={2} castShadow />
      <directionalLight position={[-1, 1, 1]} intensity={1} castShadow />
      <ambientLight intensity={0.25} />
    </>
  );
}

import { Color } from 'three';
import InfiniteGridHelper from '../../../../../components/InfiniteGridHelper';
import { useTankopedia } from '../../../../../stores/tankopedia';

export function SceneProps() {
  const showGrid = useTankopedia((state) => state.model.showGrid);

  return (
    <>
      {showGrid && (
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
        </>
      )}

      <directionalLight
        position={[1, 1, -1]}
        intensity={2}
        castShadow
        color={'rgb(225, 225, 255)'}
      />
      <directionalLight
        position={[-1, 1, 1]}
        intensity={1}
        castShadow
        color={'rgb(225, 225, 255)'}
      />
      <ambientLight intensity={0.25} />
    </>
  );
}

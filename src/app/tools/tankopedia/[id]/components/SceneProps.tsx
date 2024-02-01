import { Color } from 'three';
import InfiniteGridHelper from '../../../../../components/InfiniteGridHelper';
import { useTankopediaPersistent } from '../../../../../stores/tankopedia';

export function SceneProps() {
  const showGrid = useTankopediaPersistent(
    (state) => state.model.visual.showGrid,
  );
  const showEnvironment = useTankopediaPersistent(
    (state) => state.model.visual.showEnvironment,
  );

  if (!showGrid || showEnvironment) return null;

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
    </>
  );
}

import { Environment } from '@react-three/drei';
import { useModel } from '../../../../../hooks/useModel';
import { useDuel } from '../../../../../stores/duel';
import { useTankopediaPersistent } from '../../../../../stores/tankopedia';

export function Lighting() {
  const protagonist = useDuel((state) => state.protagonist!);
  const { hasPbr } = useModel(protagonist.tank.id);
  const showEnvironment = useTankopediaPersistent(
    (state) => state.model.visual.showEnvironment,
  );

  return (
    <>
      <Environment preset="warehouse" background={showEnvironment} blur={0} />
      <directionalLight
        position={[1, 1, -1]}
        intensity={hasPbr ? 1 : 5}
        castShadow
        color={'rgb(225, 225, 255)'}
      />
      <directionalLight
        position={[-1, 1, 1]}
        intensity={hasPbr ? 1 : 4}
        castShadow
        color={'rgb(240, 255, 240)'}
      />
    </>
  );
}

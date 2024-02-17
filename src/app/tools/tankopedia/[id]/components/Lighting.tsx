import { Environment } from '@react-three/drei';
import { useModel } from '../../../../../hooks/useModel';
import { useDuel } from '../../../../../stores/duel';
import { useTankopediaPersistent } from '../../../../../stores/tankopedia';

export const ENVIRONMENTS = [
  'lobby',
  'apartment',
  'warehouse',
  'dawn',
  'sunset',
  'night',
] as const;

export function Lighting() {
  const protagonist = useDuel((state) => state.protagonist!);
  const { hasPbr } = useModel(protagonist.tank.id);
  const showEnvironment = useTankopediaPersistent(
    (state) => state.model.visual.showEnvironment,
  );
  const environment = useTankopediaPersistent(
    (state) => state.model.visual.environment,
  );

  return (
    <>
      <Environment preset={environment} background={showEnvironment} blur={0} />
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

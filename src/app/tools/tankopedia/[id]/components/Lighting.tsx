import { Environment } from '@react-three/drei';
import { useModel } from '../../../../../hooks/useModel';
import * as Duel from '../../../../../stores/duel';
import * as TankopediaPersistent from '../../../../../stores/tankopediaPersistent';

export const ENVIRONMENTS = [
  'apartment',
  'lobby',
  'warehouse',
  'dawn',
  'sunset',
] as const;

export function Lighting() {
  const protagonist = Duel.use((state) => state.protagonist);
  const { hasPbr } = useModel(protagonist.tank.id);
  const showEnvironment = TankopediaPersistent.use(
    (state) => state.model.visual.showEnvironment,
  );
  const environment = TankopediaPersistent.use(
    (state) => state.model.visual.environmentV2,
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

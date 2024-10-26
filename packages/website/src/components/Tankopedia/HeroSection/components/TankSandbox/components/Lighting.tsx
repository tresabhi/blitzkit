import { Environment } from '@react-three/drei';
import { useModel } from '../../../../../../hooks/useModel';
import { Duel } from '../../../../../../stores/duel';
import { TankopediaPersistent } from '../../../../../../stores/tankopediaPersistent';
import { TankopediaDisplay } from '../../../../../../stores/tankopediaPersistent/constants';

export function Lighting() {
  const protagonist = Duel.use((state) => state.protagonist);
  const display = TankopediaPersistent.use((state) => state.display);
  const { hasPbr } = useModel(protagonist.tank.id);
  const isBrighterLighting =
    !hasPbr && display !== TankopediaDisplay.StaticArmor;
  const showEnvironment = TankopediaPersistent.use(
    (state) => state.showEnvironment,
  );
  const environment = TankopediaPersistent.use((state) => state.environment);

  return (
    <>
      <Environment preset={environment} background={showEnvironment} blur={0} />

      <directionalLight
        position={[1, 1, -1]}
        intensity={isBrighterLighting ? 5 : 1}
        castShadow
        color={'rgb(225, 225, 255)'}
      />
      <directionalLight
        position={[-1, 1, 1]}
        intensity={isBrighterLighting ? 4 : 1}
        castShadow
        color={'rgb(240, 255, 240)'}
      />
    </>
  );
}

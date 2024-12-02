import { Environment } from '@react-three/drei';
import { useModel } from '../../../../../../hooks/useModel';
import { Duel } from '../../../../../../stores/duel';
import { TankopediaEphemeral } from '../../../../../../stores/tankopediaEphemeral';
import { TankopediaPersistent } from '../../../../../../stores/tankopediaPersistent';
import { TankopediaDisplay } from '../../../../../../stores/tankopediaPersistent/constants';

export function Lighting() {
  const protagonist = Duel.use((state) => state.protagonist);
  const display = TankopediaEphemeral.use((state) => state.display);
  const { hasPbr } = useModel(protagonist.tank.id);
  const isBrighterLighting =
    !hasPbr && display !== TankopediaDisplay.StaticArmor;
  const showEnvironment = TankopediaPersistent.use(
    (state) => state.showEnvironment,
  );
  const environment = TankopediaPersistent.use((state) => state.environment);

  return (
    <>
      <Environment
        preset={environment}
        background={showEnvironment}
        environmentIntensity={isBrighterLighting ? 3 : 1}
      />
    </>
  );
}

import { Environment } from '@react-three/drei';
import { times } from 'lodash-es';
import { useModel } from '../../../../../../hooks/useModel';
import { Duel } from '../../../../../../stores/duel';
import { TankopediaEphemeral } from '../../../../../../stores/tankopediaEphemeral';
import { TankopediaPersistent } from '../../../../../../stores/tankopediaPersistent';
import { TankopediaDisplay } from '../../../../../../stores/tankopediaPersistent/constants';

const LIGHTS_COUNT = 5;

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
      {display !== TankopediaDisplay.ShootingRange && (
        <Environment
          preset={environment}
          background={showEnvironment}
          environmentIntensity={isBrighterLighting ? 3 : 1}
        />
      )}
      {display === TankopediaDisplay.ShootingRange && (
        <>
          <directionalLight position={[0, -1, 0]} />

          {times(LIGHTS_COUNT, (index) => (
            <directionalLight
              key={index}
              castShadow
              position={[
                Math.sin(2 * Math.PI * (index / LIGHTS_COUNT)),
                1,
                Math.cos(2 * Math.PI * (index / LIGHTS_COUNT)),
              ]}
            />
          ))}
        </>
      )}
    </>
  );
}

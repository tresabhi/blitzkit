import { Environment } from '@react-three/drei';
import { times } from 'lodash-es';
import { Euler } from 'three';
import { useModel } from '../../../../../../hooks/useModel';
import { Duel } from '../../../../../../stores/duel';
import { TankopediaEphemeral } from '../../../../../../stores/tankopediaEphemeral';
import { TankopediaDisplay } from '../../../../../../stores/tankopediaPersistent/constants';

const LIGHTS_COUNT = 5;

export function Lighting() {
  const protagonist = Duel.use((state) => state.protagonist);
  const display = TankopediaEphemeral.use((state) => state.display);
  const { hasPbr } = useModel(protagonist.tank.id);
  const isBrighterLighting =
    !hasPbr && display !== TankopediaDisplay.StaticArmor;

  return (
    <>
      <Environment
        files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/winter_river_1k.hdr"
        environmentIntensity={isBrighterLighting ? 2 : 1}
        environmentRotation={new Euler(0, Math.PI, 0)}
      />
      {display === TankopediaDisplay.ShootingRange && (
        <>
          <directionalLight position={[0, -1, 0]} />

          {times(LIGHTS_COUNT, (index) => (
            <directionalLight
              key={index}
              castShadow
              intensity={3 / LIGHTS_COUNT}
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

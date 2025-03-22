import { Environment } from '@react-three/drei';
import { times } from 'lodash-es';
import { Euler } from 'three';
import { degToRad } from 'three/src/math/MathUtils.js';
import { TankopediaEphemeral } from '../../../../../../stores/tankopediaEphemeral';
import { TankopediaDisplay } from '../../../../../../stores/tankopediaPersistent/constants';

const LIGHTS_COUNT = 5;

export function Lighting() {
  const display = TankopediaEphemeral.use((state) => state.display);
  const isBrighterLighting = display !== TankopediaDisplay.StaticArmor;

  return (
    <>
      {display !== TankopediaDisplay.StaticArmor && (
        <Environment
          files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/winter_river_1k.hdr"
          environmentIntensity={isBrighterLighting ? 1.5 : 1.25}
          environmentRotation={new Euler(0, degToRad(180), 0)}
        />
      )}
      {(display === TankopediaDisplay.StaticArmor ||
        display === TankopediaDisplay.Dissector) && (
        <Environment preset="lobby" />
      )}
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

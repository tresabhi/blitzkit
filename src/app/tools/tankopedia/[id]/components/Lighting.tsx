import { useModel } from '../../../../../hooks/useModel';
import { Duel } from '../page';

interface LightingProps {
  duel: Duel;
}

export function Lighting({ duel }: LightingProps) {
  const { hasPbr } = useModel(duel.protagonist.tank.id);

  return (
    <>
      <directionalLight
        position={[1, 1, -1]}
        intensity={hasPbr ? 3 : 5}
        castShadow
        color={'rgb(225, 225, 255)'}
      />
      <directionalLight
        position={[-1, 1, 1]}
        intensity={hasPbr ? 2 : 4}
        castShadow
        color={'rgb(240, 255, 240)'}
      />
      <ambientLight intensity={0.25} />
    </>
  );
}

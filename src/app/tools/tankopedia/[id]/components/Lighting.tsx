import { Environment } from '@react-three/drei';
import { useModel } from '../../../../../hooks/useModel';
import { useDuel } from '../../../../../stores/duel';

export function Lighting() {
  const protagonist = useDuel((state) => state.protagonist!);
  const { hasPbr } = useModel(protagonist.tank.id);

  return (
    <>
      <Environment preset="warehouse" />
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

import { useModel } from '../../../../../hooks/useModel';
import { useDuel } from '../../../../../stores/duel';

export function Lighting() {
  const protagonist = useDuel((state) => state.protagonist!);
  const { hasPbr } = useModel(protagonist.tank.id);

  return (
    <>
      {/* <Environment preset="warehouse"  /> */}
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
      <ambientLight intensity={0.5} />
    </>
  );
}

import { Html, useProgress } from '@react-three/drei';
import { Loader } from '../../../../../components/Loader';

export function ModelLoader() {
  const { progress } = useProgress();

  return (
    <Html center position={[0, 1.5, 0]}>
      <Loader naked progress={progress / 100} />
    </Html>
  );
}

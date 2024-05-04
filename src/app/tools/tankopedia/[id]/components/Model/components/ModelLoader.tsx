import { Progress } from '@radix-ui/themes';
import { Html, useProgress } from '@react-three/drei';

export function ModelLoader() {
  const { progress } = useProgress();

  return (
    <Html center position={[0, 1.5, 0]}>
      <Progress value={progress} style={{ width: 160 }} />
    </Html>
  );
}

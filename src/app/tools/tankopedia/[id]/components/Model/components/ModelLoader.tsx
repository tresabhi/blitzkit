import { Spinner } from '@radix-ui/themes';
import { Html } from '@react-three/drei';

export function ModelLoader() {
  return (
    <Html center position={[0, 1.5, 0]}>
      <Spinner size="3" />
    </Html>
  );
}

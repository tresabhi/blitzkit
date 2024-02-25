import { Html, useProgress } from '@react-three/drei';
import { theme } from '../../../../../../../stitches.config';
import { Loader } from '../../../../../components/Loader';

export function ModelLoader() {
  const { progress } = useProgress();

  return (
    <Html center position={[0, 1.5, 0]}>
      <Loader
        naked
        color={theme.colors.textHighContrast_purple}
        progress={progress / 100}
      />
    </Html>
  );
}

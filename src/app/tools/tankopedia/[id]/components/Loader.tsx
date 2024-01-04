import { Html, useProgress } from '@react-three/drei';
import { theme } from '../../../../../stitches.config';

export function Loader() {
  const { progress } = useProgress();

  return (
    <Html center>
      <div
        style={{
          width: 160,
          height: 16,
          backgroundColor: theme.colors.appBackground1_light,
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${Math.round(progress)}%`,
            height: '100%',
            backgroundColor: theme.colors.solidBackground_purple,
            transition: 'width 0.1s',
          }}
        ></div>
      </div>
    </Html>
  );
}

import { blackA } from '@radix-ui/colors';
import { Flex, Text } from '@radix-ui/themes';
import { PuffLoader } from 'react-spinners';
import { theme } from '../../../stitches.config';

const NAV_HEIGHT = 52.65;

interface LoaderProps {
  naked?: boolean;
  color?: string;
  progress?: number;
}

export function Loader({ naked, color, progress }: LoaderProps) {
  const animation = (
    <div style={{ position: 'relative' }}>
      {progress !== undefined && (
        <Text
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(calc(-50% + 5px), calc(-50% + 5px))',
          }}
        >
          {Math.round(progress * 100)}%
        </Text>
      )}
      <PuffLoader color={color ?? theme.colors.solidBackground} />
    </div>
  );

  if (naked) return animation;

  return (
    <Flex
      style={{
        backgroundColor: blackA.blackA10,
        position: 'fixed',
        top: NAV_HEIGHT,
        left: 0,
        width: '100%',
        height: `calc(100% - ${NAV_HEIGHT}px)`,
        padding: theme.spaces.paddingMajor,
      }}
      align="center"
      justify="center"
    >
      {animation}
    </Flex>
  );
}

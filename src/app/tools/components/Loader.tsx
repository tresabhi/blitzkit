import { blackA } from '@radix-ui/colors';
import { Flex, Spinner, Text } from '@radix-ui/themes';
import { theme } from '../../../stitches.config';

const NAV_HEIGHT = 52.65;

interface LoaderProps {
  naked?: boolean;
  progress?: number;
}

export function Loader({ naked, progress }: LoaderProps) {
  const animation = (
    <Flex align="center" gap="2">
      <Spinner />
      {progress !== undefined && (
        <Text color="gray">{Math.round(progress * 100)}%</Text>
      )}
    </Flex>
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

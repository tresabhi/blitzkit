import { blackA } from '@radix-ui/colors';
import { Flex } from '@radix-ui/themes';
import { PuffLoader } from 'react-spinners';
import { theme } from '../../../stitches.config';

const NAV_HEIGHT = 52.65;

interface LoaderProps {
  naked?: boolean;
  color?: string;
}

export function Loader({ naked, color }: LoaderProps) {
  const animation = (
    <PuffLoader color={color ?? theme.colors.solidBackground} />
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

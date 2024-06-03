import { Flex, Heading, Text } from '@radix-ui/themes';
import { imgur } from '../../core/blitzkit/imgur';
import { theme } from '../../stitches.config';

export function Hero() {
  return (
    <Flex
      align="center"
      justify="center"
      style={{
        position: 'relative',
      }}
      px="4"
      py="9"
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `url(${imgur('rUPie9G', { format: 'jpeg' })})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `linear-gradient(${theme.colors.appBackground1}80, ${theme.colors.appBackground1}ff)`,
        }}
      />

      <Flex
        direction="column"
        gap="4"
        align="center"
        justify="center"
        style={{ position: 'relative', width: '100%' }}
      >
        <Flex direction="column" align="center">
          <Heading size="9" weight="bold" align="center">
            BlitzKit
          </Heading>
          <Text color="gray" align="center" size="4">
            Everything World of Tanks Blitz
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
}

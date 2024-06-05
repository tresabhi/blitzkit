import { Flex, Heading, Text } from '@radix-ui/themes';
import { imgur } from '../../core/blitzkit/imgur';

export function Hero() {
  return (
    <Flex
      align="center"
      justify="center"
      style={{
        position: 'relative',
        background: `url(${imgur('rUPie9G', { format: 'jpeg' })})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
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
          background:
            'linear-gradient(var(--color-panel-translucent), var(--color-background))',
        }}
      />

      <Flex
        direction="column"
        gap="4"
        align="center"
        justify="center"
        position="relative"
        width="100%"
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

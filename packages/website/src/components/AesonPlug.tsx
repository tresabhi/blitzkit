import { Flex, Heading, Link, Text } from '@radix-ui/themes';
import { Var } from '../core/radix/var';

export function AesonPlug() {
  return (
    <Link
      color="gray"
      highContrast
      href="https://discord.gg/WHdER7ZPAD"
      underline="hover"
    >
      <Flex
        style={{
          backgroundColor: Var('green-3'),
          borderRadius: Var('radius-3'),
          overflow: 'hidden',
        }}
      >
        <img
          src="/assets/images/third-party/wotb-news.png"
          style={{ width: '6rem', height: '6rem', objectFit: 'cover' }}
        />

        <Flex py="3" px="5" direction="column" justify="center">
          <Heading size="5">Preview brought to you by WoT Blitz News</Heading>
          <Text color="gray">What the hell do I put here haha</Text>
        </Flex>
      </Flex>
    </Link>
  );
}

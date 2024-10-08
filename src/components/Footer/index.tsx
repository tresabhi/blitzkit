'use client';

import { Code, Flex, Heading, Text, Theme } from '@radix-ui/themes';
import { use } from 'react';
import packageJson from '../../../package.json';
import { gameDefinitions } from '../../core/blitzkit/gameDefinitions';
import { Link } from '../Link';

export function Footer() {
  const awaitedGameDefinitions = use(gameDefinitions);

  return (
    <Theme radius="none">
      <Flex
        gap="6"
        p="6"
        direction="column"
        align="center"
        style={{ backgroundColor: 'var(--color-panel)' }}
      >
        <Flex
          align="center"
          justify="between"
          maxWidth="40rem"
          width="100%"
          flexGrow="1"
          gap="5"
          position="relative"
          direction={{ initial: 'column', sm: 'row' }}
        >
          <Flex
            direction="column"
            align={{
              initial: 'center',
              sm: 'start',
            }}
          >
            <Heading>BlitzKit </Heading>
            <Text color="gray">Everything World of Tanks Blitz</Text>
            <Text size="1" color="gray">
              Unaffiliated with Wargaming or any service
            </Text>
          </Flex>

          <Flex
            gap="6"
            width={{
              initial: '100%',
              sm: 'auto',
            }}
          >
            <Flex
              direction="column"
              gap="1"
              align={{
                initial: 'end',
                sm: 'start',
              }}
              flexGrow={{
                initial: '1',
                sm: '0',
              }}
              flexBasis={{
                initial: '0',
                sm: 'auto',
              }}
            >
              <Heading size="3">About</Heading>
              <Flex
                direction="column"
                align={{
                  initial: 'end',
                  sm: 'start',
                }}
              >
                <Link href="/docs/about/credits" color="gray">
                  Credits
                </Link>
                <Link
                  href="https://discord.gg/nDt7AjGJQH"
                  target="_blank"
                  color="gray"
                >
                  Discord
                </Link>
                <Link
                  href="https://github.com/tresabhi/blitzkit"
                  target="_blank"
                  color="gray"
                >
                  GitHub
                </Link>
                <Link href="/docs/patches" color="gray">
                  Patches
                </Link>

                {/* patreon supporters? */}
              </Flex>
            </Flex>

            <Flex
              direction="column"
              gap="1"
              flexGrow={{
                initial: '1',
                sm: '0',
              }}
              flexBasis={{
                initial: '0',
                sm: 'auto',
              }}
            >
              <Heading size="3">Legal</Heading>
              <Flex direction="column">
                <Link href="/docs/legal/privacy-policy" color="gray">
                  Privacy policy
                </Link>
                <Link href="/docs/legal/terms-of-service" color="gray">
                  Terms of service
                </Link>
                <Link
                  href="https://www.google.com/settings/ads"
                  target="_blank"
                  color="gray"
                >
                  Ad settings
                </Link>
              </Flex>
            </Flex>
          </Flex>
        </Flex>

        <Flex gap="5" display={{ initial: 'flex', sm: 'none' }}>
          <Flex direction="column" justify="between" align="end">
            <Text size="2" color="gray">
              BlitzKit
            </Text>
            <Text size="2" color="gray">
              WoT Blitz
            </Text>
            <Text size="2" color="gray">
              CDN
            </Text>
          </Flex>

          <Flex direction="column" justify="between" align="start">
            <Code size="2" color="gray">
              {packageJson.version}
            </Code>
            <Code size="2" color="gray">
              {awaitedGameDefinitions.version}
            </Code>
            <Code size="2" color="gray">
              {process.env.NEXT_PUBLIC_ASSET_BRANCH}
            </Code>
          </Flex>
        </Flex>

        <Flex gap="2" align="center" display={{ initial: 'none', sm: 'flex' }}>
          <Text size="2" color="gray">
            BlitzKit
          </Text>
          <Code size="2" color="gray">
            {packageJson.version}
          </Code>
          <Text size="2" color="gray">
            WoT Blitz
          </Text>
          <Code size="2" color="gray">
            {awaitedGameDefinitions.version}
          </Code>
          <Text size="2" color="gray">
            CDN
          </Text>
          <Code size="2" color="gray">
            {process.env.NEXT_PUBLIC_ASSET_BRANCH}
          </Code>
        </Flex>
      </Flex>
    </Theme>
  );
}

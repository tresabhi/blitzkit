'use client';

import { Flex, Heading, Text, Theme } from '@radix-ui/themes';
import packageJson from '../../../package.json';
import { Link } from '../Link';

export function Footer() {
  return (
    <Theme radius="none">
      <Flex
        justify="center"
        gap="3"
        p="6"
        style={{
          backgroundColor: 'var(--color-panel)',
        }}
      >
        <Flex
          align="center"
          justify="between"
          maxWidth="640px"
          flexGrow="1"
          gap="6"
          position="relative"
          direction={{
            initial: 'column',
            sm: 'row',
          }}
        >
          <Flex direction="column">
            <Heading>
              BlitzKit{' '}
              <Text color="gray" size="1" weight="regular">
                {packageJson.version}
              </Text>
            </Heading>

            <Text color="gray">Everything World of Tanks Blitz</Text>
          </Flex>

          <Flex gap="6">
            <Flex
              direction="column"
              gap="1"
              align={{
                initial: 'end',
                sm: 'start',
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

                {/* patreon supporters? */}
              </Flex>
            </Flex>

            <Flex direction="column" gap="1">
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
      </Flex>
    </Theme>
  );
}

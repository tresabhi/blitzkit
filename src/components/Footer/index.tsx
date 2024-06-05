'use client';

import { Flex, Heading, Text, Theme } from '@radix-ui/themes';
import { Link } from '../Link';
import * as styles from './index.css';

export function Footer() {
  return (
    <Theme radius="none">
      <Flex
        justify="center"
        gap="3"
        px="3"
        py="6"
        style={{
          backgroundColor: 'var(--color-panel)',
        }}
      >
        <Flex align="center" wrap="wrap" className={styles.containerInner}>
          <Flex direction="column">
            <Heading>BlitzKit</Heading>
            <Text color="gray">Everything World of Tanks Blitz</Text>
          </Flex>

          <Flex gap="6">
            <Flex direction="column" gap="1">
              <Heading size="3">Legal</Heading>
              <Flex direction="column">
                <Link href="/docs/legal/privacy-policy" color="gray">
                  Privacy policy
                </Link>
                <Link href="/docs/legal/terms-of-service" color="gray">
                  Terms of service
                </Link>
              </Flex>
            </Flex>

            <Flex direction="column" gap="1">
              <Heading size="3">About</Heading>
              <Flex direction="column">
                <Link href="/docs/about/credits" color="gray">
                  Credits
                </Link>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Theme>
  );
}

'use client';

import { Code, Flex, Link, Spinner, Text, Theme } from '@radix-ui/themes';
import { Suspense } from 'react';
import packageJSON from '../../../package.json';
import { WoTBVersion } from './components/WoTBVersion';
import * as styles from './index.css';

export function Footer() {
  return (
    <Theme radius="none">
      <Flex
        justify="center"
        align="center"
        gap="3"
        p="3"
        style={{
          backgroundColor: 'var(--color-panel)',
        }}
      >
        <Flex align="center" wrap="wrap" className={styles.containerInner}>
          <Flex gap="1" justify="center" align="center">
            <Text color="gray" size="2">
              BlitzKit
            </Text>

            <Code color="gray" size="2">
              {packageJSON.version}
            </Code>

            <Text color="gray" size="2">
              for WoTB
            </Text>

            <Suspense fallback={<Spinner />}>
              <WoTBVersion />
            </Suspense>
          </Flex>

          <Flex
            justify="center"
            align="center"
            gap="2"
            style={{
              maxWidth: 800,
              padding: '0 16px',
            }}
          >
            <Link size="2" href="https://tresabhi.github.io/" target="_blank">
              Made by TrèsAbhi
            </Link>

            <Text color="gray">•</Text>

            <Link
              size="2"
              href="https://tresabhi.github.io/blitzkit/guide/credits.html"
              target="_blank"
            >
              Full credits
            </Link>
          </Flex>
        </Flex>
      </Flex>
    </Theme>
  );
}

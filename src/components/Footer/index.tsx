import { Card, Code, Flex, Link, Spinner, Text, Theme } from '@radix-ui/themes';
import { Suspense } from 'react';
import packageJSON from '../../../package.json';
import { useWideFormat } from '../../hooks/useWideFormat';
import { WoTBVersion } from './components/WoTBVersion';

export function Footer() {
  const wideFormat = useWideFormat(640);

  return (
    <Theme radius="none">
      <Card>
        <Flex justify="center" align="center" gap="3">
          <Flex
            align="center"
            justify={wideFormat ? 'between' : 'center'}
            wrap="wrap"
            style={{
              width: '100%',
              maxWidth: 800,
              padding: '0 16px',
            }}
          >
            <Flex gap="1" justify="center" align="center">
              <Text color="gray" size="2">
                Blitzrinth
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
      </Card>
    </Theme>
  );
}

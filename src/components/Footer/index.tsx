import { Card, Code, Flex, Link, Spinner, Text, Theme } from '@radix-ui/themes';
import { Suspense } from 'react';
import packageJSON from '../../../package.json';
import { useWideFormat } from '../../hooks/useWideFormat';
import { WoTBVersion } from './components/WoTBVersion';

export function Footer() {
  const wideFormat = useWideFormat();

  return (
    <Theme radius="none">
      <Card>
        <Flex justify="center">
          <Flex
            justify={wideFormat ? 'between' : 'center'}
            style={{
              flex: 1,
              maxWidth: 800,
              padding: '0 16px',
            }}
          >
            <Flex gap="1">
              <Text color="gray" size="2">
                Blitzkrieg
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

            {wideFormat && (
              <Link
                size="2"
                href="https://www.patreon.com/tresabhi"
                target="_blank"
              >
                Consider donating on Patreon
              </Link>
            )}
          </Flex>
        </Flex>
      </Card>
    </Theme>
  );
}

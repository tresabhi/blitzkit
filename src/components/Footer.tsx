import { Card, Code, Flex, Text, Theme } from '@radix-ui/themes';
import { use } from 'react';
import packageJSON from '../../package.json';
import { gameDefinitions } from '../core/blitzkrieg/gameDefinitions';
import { useWideFormat } from '../hooks/useWideFormat';

export function Footer() {
  const wideFormat = useWideFormat();
  const awaitedGameDefinitions = use(gameDefinitions);

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
            <Text color="gray" size="2">
              Blitzkrieg <Code>{packageJSON.version}</Code> for WoTB{' '}
              <Code>{awaitedGameDefinitions.version}</Code>
            </Text>

            {wideFormat && (
              <Text color="gray" size="2">
                Free forever, for everyone.
              </Text>
            )}
          </Flex>
        </Flex>
      </Card>
    </Theme>
  );
}

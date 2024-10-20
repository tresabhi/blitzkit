import { assertSecret } from '@blitzkit/core';
import { ArrowRightIcon } from '@radix-ui/react-icons';
import { Button, Code, Flex, Link, Text } from '@radix-ui/themes';
import { App } from '../stores/app';

export function Plugs() {
  return (
    <App.Provider>
      <Content />
    </App.Provider>
  );
}

function Content() {
  const promoteOpentest =
    assertSecret(import.meta.env.PUBLIC_PROMOTE_OPENTEST) === 'true' &&
    assertSecret(import.meta.env.PUBLIC_ASSET_BRANCH) !== 'opentest';
  const promotions = [promoteOpentest];

  if (promotions.every((promotion) => !promotion)) return null;

  return (
    <Flex
      align="center"
      direction="column"
      justify="center"
      px="4"
      py="8"
      gap="6"
    >
      {promoteOpentest && (
        <Flex direction="column" gap="3" align="center">
          <Text size="5">
            BlitzKit{' '}
            <Code variant="outline" size="4" color="gray" highContrast>
              opentest
            </Code>{' '}
            is available now{' '}
          </Text>

          <Link href="https://opentest.blitzkit.app/" target="_blank">
            <Button color="green">
              BlitzKit opentest <ArrowRightIcon />
            </Button>
          </Link>
        </Flex>
      )}
    </Flex>
  );
}

'use client';

import { CheckIcon } from '@radix-ui/react-icons';
import { Button, Flex, Link, Text } from '@radix-ui/themes';
import { useLayoutEffect, useState } from 'react';
import { patreonLoginUrl } from '../../core/blitzkit/patreonLoginUrl';
import { useAdExempt } from '../../hooks/useAdExempt';
import { PatreonIcon } from '../../icons/Patreon';
import * as App from '../../stores/app';

export function PatreonPlug() {
  const [hasPatreon, setHasPatreon] = useState(false);
  const exempt = useAdExempt();
  const patreon = App.use((state) => state.logins.patreon);

  useLayoutEffect(() => {
    setHasPatreon(patreon !== undefined);
  }, [patreon]);

  return (
    <Flex
      gap="2"
      align="center"
      direction="column"
      justify="center"
      p="4"
      py="8"
    >
      <Flex gap="1" align="center">
        <Text size="4" align="center">
          {exempt
            ? 'You are supporting BlitzKit, thank you!'
            : 'Active Patreon supports go ad-free'}
        </Text>
        {!exempt && <CheckIcon width="1em" height="1em" />}
      </Flex>

      <Flex gap="2" wrap="wrap" justify="center">
        <Link href="https://www.patreon.com/tresabhi" target="_blank">
          <Button>
            <PatreonIcon width={15} height={15} />{' '}
            {exempt ? 'Manage membership' : 'Support on Patreon'}
          </Button>
        </Link>
        {!hasPatreon && !exempt && (
          <Link href={patreonLoginUrl()}>
            <Button variant="outline">Log in with Patreon</Button>
          </Link>
        )}
      </Flex>
    </Flex>
  );
}

'use client';

import { assertSecret, patreonLoginUrl } from '@blitzkit/core';
import { ArrowRightIcon } from '@radix-ui/react-icons';
import {
  Badge,
  Button,
  Code,
  Flex,
  Link,
  Separator,
  Text,
} from '@radix-ui/themes';
import { useLayoutEffect, useState } from 'react';
import { PatreonIcon } from '../../components/PatreonIcon';
import { useAdExempt } from '../../hooks/useAdExempt';
import * as App from '../../stores/app';

export function Plugs() {
  const [hasPatreon, setHasPatreon] = useState(false);
  const exempt = useAdExempt();
  const patreon = App.use((state) => state.logins.patreon);

  useLayoutEffect(() => {
    setHasPatreon(patreon !== undefined);
  }, [patreon]);

  return (
    <Flex
      align="center"
      direction="column"
      justify="center"
      px="4"
      py="8"
      gap="6"
    >
      {assertSecret(process.env.NEXT_PUBLIC_PROMOTE_OPENTEST) === 'true' &&
        assertSecret(process.env.NEXT_PUBLIC_ASSET_BRANCH) !== 'opentest' && (
          <>
            <Flex direction="column" gap="3" align="center">
              <Flex align="center" gap="2">
                <Badge color="green">NEW</Badge>
                <Text size="5">
                  BlitzKit{' '}
                  <Code variant="outline" size="4" color="gray" highContrast>
                    opentest
                  </Code>{' '}
                  is available now{' '}
                </Text>
              </Flex>

              <Link href="https://opentest.blitzkit.app/" target="_blank">
                <Button color="green">
                  BlitzKit opentest <ArrowRightIcon />
                </Button>
              </Link>
            </Flex>

            <Separator size="3" />
          </>
        )}

      <Flex direction="column" gap="3" align="center">
        <Flex gap="1" align="center">
          <Text size="4" align="center">
            {exempt
              ? 'You are supporting BlitzKit, thank you!'
              : 'Active Patreon supports go ad-free'}
          </Text>
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
    </Flex>
  );
}

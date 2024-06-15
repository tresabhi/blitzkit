'use client';

import { CheckIcon } from '@radix-ui/react-icons';
import { Button, Flex, Link, Text } from '@radix-ui/themes';
import { patreonLoginUrl } from '../../core/blitzkit/patreonLoginUrl';
import { useAdExempt } from '../../hooks/useAdExempt';
import { PatreonIcon } from '../../icons/Patreon';
import { useApp } from '../../stores/app';

export function PatreonPlug() {
  const patreon = useApp((state) => state.logins.patreon);
  const exempt = useAdExempt();

  if (exempt) return null;

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
          Active Patreon supports go ad-free
        </Text>
        <CheckIcon width="1em" height="1em" />
      </Flex>

      <Flex gap="2" wrap="wrap" justify="center">
        <Link href="https://www.patreon.com/tresabhi" target="_blank">
          <Button>
            <PatreonIcon width={15} height={15} /> Support on Patreon
          </Button>
        </Link>
        {!patreon && (
          <Link href={patreonLoginUrl()}>
            <Button variant="outline">Log in with Patreon</Button>
          </Link>
        )}
      </Flex>
    </Flex>
  );
}

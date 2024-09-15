import { patreonLoginUrl } from '@blitzkit/core';
import { useStore } from '@nanostores/react';
import { PersonIcon } from '@radix-ui/react-icons';
import {
  Button,
  Flex,
  IconButton,
  Inset,
  Link,
  Popover,
  Separator,
  Skeleton,
  Text,
} from '@radix-ui/themes';
import { Suspense } from 'react';
import { $patreonLogin } from '../stores/patreonLogin';
import { $wargamingLogin } from '../stores/wargamingLogin';
import { PatreonIcon } from './PatreonIcon';
import { WargamingAccountName } from './WargamingAccountName';
import { WargamingIcon } from './WargamingIcon';
import { WargamingLoginButton } from './WargamingLoginButton';

export function NavbarAccount() {
  const patreonLogin = useStore($patreonLogin);
  const wargamingLogin = useStore($wargamingLogin);

  return (
    <Popover.Root>
      <Popover.Trigger>
        <IconButton variant="ghost" color="gray">
          <PersonIcon />
        </IconButton>
      </Popover.Trigger>

      <Popover.Content
        align="end"
        width="320px"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        {(patreonLogin.token || wargamingLogin.token) && (
          <Flex direction="column" gap="2">
            <Text align="center" color="gray">
              Logged in accounts
            </Text>

            {patreonLogin.token && (
              <Flex align="center" gap="2" justify="center">
                <PatreonIcon width={15} height={15} />
                <Text>Patreon</Text>
                <Button
                  color="red"
                  variant="ghost"
                  onClick={() => {
                    $patreonLogin.set({ token: undefined });
                  }}
                >
                  Logout
                </Button>
              </Flex>
            )}

            {wargamingLogin.token && (
              <Flex align="center" gap="2" justify="center">
                <WargamingIcon width={15} height={15} />
                <Text>
                  <Suspense fallback={<Skeleton height="1em" width="5rem" />}>
                    <WargamingAccountName />
                  </Suspense>
                </Text>
                <Button
                  color="red"
                  variant="ghost"
                  onClick={() => {
                    $wargamingLogin.set({ token: undefined });
                  }}
                >
                  Logout
                </Button>
              </Flex>
            )}
          </Flex>
        )}

        {!patreonLogin.token !== !wargamingLogin.token && (
          <Inset side="x">
            <Separator my="4" size="4" />
          </Inset>
        )}

        {(!patreonLogin.token || !wargamingLogin.token) && (
          <Flex direction="column" gap="2">
            <Text align="center" color="gray">
              Log in with...
            </Text>

            {!patreonLogin.token && (
              <Link style={{ width: '100%' }} href={patreonLoginUrl()}>
                <Button style={{ width: '100%' }} color="tomato">
                  <PatreonIcon width={15} height={15} /> Patreon
                </Button>
              </Link>
            )}

            {!wargamingLogin.token && <WargamingLoginButton />}
          </Flex>
        )}
      </Popover.Content>
    </Popover.Root>
  );
}

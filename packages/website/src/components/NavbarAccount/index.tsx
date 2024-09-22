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
import { App } from '../../stores/app';
import { $patreonLogin } from '../../stores/patreonLogin';
import { $wargamingLogin } from '../../stores/wargamingLogin';
import { BlitzKitTheme } from '../BlitzKitTheme';
import { PatreonIcon } from '../PatreonIcon';
import { WargamingAccountName } from '../WargamingAccountName';
import { WargamingIcon } from '../WargamingIcon';
import { WargamingLoginButton } from '../WargamingLoginButton';

export function NavbarAccount() {
  const patreon = useStore($patreonLogin);
  const wargaming = useStore($wargamingLogin);

  return (
    <App.Provider>
      <Popover.Root>
        <Popover.Trigger>
          <IconButton variant="ghost" color="gray">
            <PersonIcon />
          </IconButton>
        </Popover.Trigger>

        <BlitzKitTheme>
          <Popover.Content
            align="end"
            width="320px"
            onOpenAutoFocus={(event) => event.preventDefault()}
          >
            {(patreon.token || wargaming.token) && (
              <Flex direction="column" gap="2">
                <Text align="center" color="gray">
                  Logged in accounts
                </Text>

                {patreon.token && (
                  <Flex align="center" gap="2" justify="center">
                    <PatreonIcon width={15} height={15} />
                    <Text>Patreon</Text>
                    <Button
                      color="red"
                      variant="ghost"
                      onClick={() => {
                        $patreonLogin.setKey('token', undefined);
                      }}
                    >
                      Logout
                    </Button>
                  </Flex>
                )}

                {wargaming.token && (
                  <Flex align="center" gap="2" justify="center">
                    <WargamingIcon width={15} height={15} />
                    <Text>
                      <Suspense
                        fallback={<Skeleton height="1em" width="5rem" />}
                      >
                        <WargamingAccountName />
                      </Suspense>
                    </Text>
                    <Button
                      color="red"
                      variant="ghost"
                      onClick={() => {
                        $wargamingLogin.setKey('token', undefined);
                      }}
                    >
                      Logout
                    </Button>
                  </Flex>
                )}
              </Flex>
            )}

            {!patreon.token !== !wargaming.token && (
              <Inset side="x">
                <Separator my="4" size="4" />
              </Inset>
            )}

            {(!patreon.token || !wargaming.token) && (
              <Flex direction="column" gap="2">
                <Text align="center" color="gray">
                  Log in with...
                </Text>

                {!patreon.token && (
                  <Link style={{ width: '100%' }} href={patreonLoginUrl()}>
                    <Button style={{ width: '100%' }} color="tomato">
                      <PatreonIcon width={15} height={15} /> Patreon
                    </Button>
                  </Link>
                )}

                {!wargaming.token && <WargamingLoginButton />}
              </Flex>
            )}
          </Popover.Content>
        </BlitzKitTheme>
      </Popover.Root>
    </App.Provider>
  );
}

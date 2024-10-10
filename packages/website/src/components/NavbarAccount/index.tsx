import { patreonLoginUrl } from '@blitzkit/core';
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
import { BlitzKitTheme } from '../BlitzKitTheme';
import { PatreonIcon } from '../PatreonIcon';
import { WargamingAccountName } from '../WargamingAccountName';
import { WargamingIcon } from '../WargamingIcon';
import { WargamingLoginButton } from '../WargamingLoginButton';

export function NavbarAccount() {
  return (
    <App.Provider>
      <Content />
    </App.Provider>
  );
}

function Content() {
  const logins = App.use((state) => state.logins);
  const mutateApp = App.useMutation();

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
            {(logins.patreon || logins.wargaming) && (
              <Flex direction="column" gap="2">
                <Text align="center" color="gray">
                  Logged in accounts
                </Text>

                {logins.patreon && (
                  <Flex align="center" gap="2" justify="center">
                    <PatreonIcon width={15} height={15} />
                    <Text>Patreon</Text>
                    <Button
                      color="red"
                      variant="ghost"
                      onClick={() => {
                        mutateApp((draft) => {
                          draft.logins.patreon = undefined;
                        });
                      }}
                    >
                      Logout
                    </Button>
                  </Flex>
                )}

                {logins.wargaming && (
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
                        mutateApp((draft) => {
                          draft.logins.wargaming = undefined;
                        });
                      }}
                    >
                      Logout
                    </Button>
                  </Flex>
                )}
              </Flex>
            )}

            {!logins.patreon !== !logins.wargaming && (
              <Inset side="x">
                <Separator my="4" size="4" />
              </Inset>
            )}

            {(!logins.patreon || !logins.wargaming) && (
              <Flex direction="column" gap="2">
                <Text align="center" color="gray">
                  Log in with...
                </Text>

                {!logins.patreon && (
                  <Link style={{ width: '100%' }} href={patreonLoginUrl()}>
                    <Button style={{ width: '100%' }} color="tomato">
                      <PatreonIcon width={15} height={15} /> Patreon
                    </Button>
                  </Link>
                )}

                {!logins.wargaming && <WargamingLoginButton />}
              </Flex>
            )}
          </Popover.Content>
        </BlitzKitTheme>
      </Popover.Root>
    </App.Provider>
  );
}

'use client';

import { assertSecret } from '@blitzkit/core/src/blitzkit/assertSecret';
import { imgur, ImgurSize } from '@blitzkit/core/src/imgur/imgur';
import { patreonLoginUrl } from '@blitzkit/core/src/patreon/patreonLoginUrl';
import {
  Cross1Icon,
  DiscordLogoIcon,
  GearIcon,
  HamburgerMenuIcon,
  PersonIcon,
} from '@radix-ui/react-icons';
import {
  Box,
  Button,
  Code,
  Flex,
  Grid,
  IconButton,
  Inset,
  Popover,
  ScrollArea,
  Separator,
  Skeleton,
  Text,
} from '@radix-ui/themes';
import { usePathname } from 'next/navigation';
import { Fragment, Suspense, useState } from 'react';
import { BRANCH_NAMES } from '../../app/components/Hero/constants';
import { homeTool, TOOLS } from '../../constants/tools';
import * as App from '../../stores/app';
import { Link } from '../Link';
import { PatreonIcon } from '../PatreonIcon';
import { WargamingIcon } from '../WargamingIcon';
import { WargamingAccountName } from './components/WargamingAccountName';
import { WargamingLoginButton } from './components/WargamingLoginButton';
import * as styles from './index.css';

export function Navbar() {
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const pathname = usePathname();
  const logins = App.use((state) => state.logins);
  const mutateApp = App.useMutation();
  const tools = [homeTool, ...TOOLS];
  const isBranchNamed =
    process.env.NEXT_PUBLIC_ASSET_BRANCH &&
    BRANCH_NAMES[process.env.NEXT_PUBLIC_ASSET_BRANCH];

  return (
    <Flex className={styles.navbar}>
      <Flex
        className={styles.navbarExpander[`${showHamburgerMenu}`]}
        onClick={() => setShowHamburgerMenu(false)}
        direction="column"
        gap="2"
      >
        <Flex justify="center">
          <Flex flexGrow="1" maxWidth="1024px" p="3" align="center">
            <Flex gap="3" align="center">
              <IconButton
                variant="ghost"
                color="gray"
                className={styles.hamburger}
                onClick={(event) => {
                  event.stopPropagation();
                  setShowHamburgerMenu((state) => !state);
                }}
              >
                {showHamburgerMenu ? <Cross1Icon /> : <HamburgerMenuIcon />}
              </IconButton>

              <Link
                color="gray"
                highContrast
                href="/"
                underline="hover"
                weight="bold"
                onClick={() => setShowHamburgerMenu(false)}
              >
                <Flex align="center" gap="1">
                  BlitzKit
                  {isBranchNamed && (
                    <Code color="gray" size="1" highContrast variant="outline">
                      {BRANCH_NAMES[process.env.NEXT_PUBLIC_ASSET_BRANCH!]}
                    </Code>
                  )}
                </Flex>
              </Link>
            </Flex>

            <Box flexGrow="1" />

            <Flex
              align="center"
              gap="2"
              justify="center"
              className={styles.tools}
            >
              {TOOLS.map((tool, index) => {
                const unavailableOnBranch = tool.branches?.every(
                  (branch) =>
                    branch !==
                    assertSecret(process.env.NEXT_PUBLIC_ASSET_BRANCH),
                );
                const selected = pathname.startsWith(`/tools/${tool.id}`);

                if (unavailableOnBranch) return null;

                return (
                  <Fragment key={tool.title}>
                    {index > 0 && <Separator orientation="vertical" size="1" />}
                    <Link
                      onClick={() => setShowHamburgerMenu(false)}
                      color="gray"
                      highContrast={selected}
                      size="2"
                      href={`/tools/${tool.id}`}
                      underline={selected ? 'always' : 'hover'}
                    >
                      {tool.title}
                    </Link>
                  </Fragment>
                );
              })}
            </Flex>

            <Box flexGrow="1" />

            <Flex align="center" gap="3">
              <Link
                style={{ display: 'flex', alignContent: 'center' }}
                color="gray"
                href="https://discord.gg/nDt7AjGJQH"
                underline="none"
                target="_blank"
                onClick={() => setShowHamburgerMenu(false)}
              >
                <DiscordLogoIcon />
              </Link>
              <Link
                style={{ display: 'flex', alignContent: 'center' }}
                color="gray"
                href="https://www.patreon.com/tresabhi"
                underline="none"
                target="_blank"
                onClick={() => setShowHamburgerMenu(false)}
              >
                <PatreonIcon width="0.75em" height="0.75em" />
              </Link>
              <Link
                style={{ display: 'flex', alignContent: 'center' }}
                color="gray"
                href="/settings"
                underline="none"
                onClick={() => setShowHamburgerMenu(false)}
              >
                <GearIcon />
              </Link>
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
                            onClick={() =>
                              mutateApp((draft) => {
                                draft.logins.patreon = undefined;
                              })
                            }
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
                            onClick={() =>
                              mutateApp((draft) => {
                                draft.logins.wargaming = undefined;
                              })
                            }
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
                        <Link
                          style={{ width: '100%' }}
                          href={patreonLoginUrl()}
                        >
                          <Button style={{ width: '100%' }} color="tomato">
                            <PatreonIcon width={15} height={15} /> Patreon
                          </Button>
                        </Link>
                      )}

                      {!logins.wargaming && <WargamingLoginButton />}
                    </Flex>
                  )}
                </Popover.Content>
              </Popover.Root>
            </Flex>
          </Flex>
        </Flex>

        <ScrollArea>
          <Grid
            columns="repeat(auto-fill, minmax(192px, 1fr))"
            flow="dense"
            gap="2"
            width="100%"
            p="3"
            pt="0"
          >
            {tools.map((tool) => {
              const unavailableOnBranch = tool.branches?.every(
                (branch) =>
                  branch !== assertSecret(process.env.NEXT_PUBLIC_ASSET_BRANCH),
              );

              if (unavailableOnBranch) return null;

              return (
                <Flex
                  key={tool.id}
                  onClick={() => setShowHamburgerMenu(false)}
                  style={{
                    position: 'relative',
                    borderRadius: 'var(--radius-2)',
                    overflow: 'hidden',
                    backgroundImage: `url(${imgur(tool.image, { format: 'jpeg', size: ImgurSize.MediumThumbnail })})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    aspectRatio: '2 / 1',
                  }}
                >
                  <Link
                    href={tool.id.length === 0 ? '/' : `/tools/${tool.id}`}
                    style={{
                      display: 'flex',
                      width: '100%',
                      height: '100%',
                      flexDirection: 'column',
                      textDecoration: 'none',
                      color: 'inherit',
                    }}
                  >
                    <Box
                      flexGrow="1"
                      style={{
                        backgroundImage: `url(${imgur(tool.image, { format: 'jpeg', size: ImgurSize.MediumThumbnail })})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />

                    <Flex
                      p="2"
                      align="center"
                      width="100%"
                      style={{
                        backgroundColor: 'var(--color-panel-translucent)',
                        backdropFilter: 'blur(4rem)',
                        WebkitBackdropFilter: 'blur(4rem)',
                      }}
                    >
                      <Text weight="medium">{tool.title}</Text>
                    </Flex>
                  </Link>
                </Flex>
              );
            })}
          </Grid>
        </ScrollArea>
      </Flex>
    </Flex>
  );
}

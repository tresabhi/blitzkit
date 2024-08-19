'use client';

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
  Dialog,
  Flex,
  Grid,
  IconButton,
  Inset,
  Popover,
  ScrollArea,
  Separator,
  Text,
} from '@radix-ui/themes';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { REGIONS } from '../../constants/regions';
import { homeTool, TOOLS } from '../../constants/tools';
import { WARGAMING_APPLICATION_ID } from '../../constants/wargamingApplicationID';
import { imgur, ImgurSize } from '../../core/blitzkit/imgur';
import { patreonLoginUrl } from '../../core/blitzkit/patreonLoginUrl';
import { PatreonIcon } from '../../icons/Patreon';
import { WargamingIcon } from '../../icons/Wargaming';
import strings from '../../lang/en-US.json';
import * as App from '../../stores/app';
import { Link } from '../Link';
import * as styles from './index.css';

export default function Navbar() {
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const pathname = usePathname();
  const logins = App.use((state) => state.logins);
  const mutateApp = App.useMutation();
  const tools = [homeTool, ...TOOLS];

  return (
    <Flex className={styles.navbar}>
      <Flex
        className={styles.navbarExpander[`${showHamburgerMenu}`]}
        align="start"
        onClick={() => setShowHamburgerMenu((state) => !state)}
      >
        <Flex
          className={styles.navbarContent}
          direction="column"
          onClick={(event) => event.stopPropagation()}
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
                  BlitzKit
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
                  const selected = pathname.startsWith(`/tools/${tool.id}`);

                  return (
                    <>
                      {index > 0 && (
                        <Separator orientation="vertical" size="1" />
                      )}
                      <Link
                        onClick={() => setShowHamburgerMenu(false)}
                        color="gray"
                        highContrast={selected}
                        size="2"
                        href={`tools/${tool.id}`}
                        key={tool.title}
                        underline={selected ? 'always' : 'hover'}
                      >
                        {tool.title}
                      </Link>
                    </>
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
                  href="https://discord.gg/nDt7AjGJQH"
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
                  target="_blank"
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
                            <Text>Wargaming</Text>
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

                        {!logins.wargaming && (
                          <Dialog.Root>
                            <Dialog.Trigger>
                              <Button color="red">
                                <WargamingIcon width={15} height={15} />{' '}
                                Wargaming
                              </Button>
                            </Dialog.Trigger>

                            <Dialog.Content width="fit-content">
                              <Flex direction="column" gap="4" align="center">
                                <Text color="gray">Choose your region</Text>

                                <Flex gap="2" wrap="wrap">
                                  {REGIONS.map((region) => (
                                    <Dialog.Close key={region}>
                                      <Link
                                        href={
                                          typeof window !== 'undefined'
                                            ? `https://api.worldoftanks.${region}/wot/auth/login/?application_id=${WARGAMING_APPLICATION_ID}&redirect_uri=${encodeURIComponent(
                                                `${location.origin}/auth/wargaming?return=${location.origin}${location.pathname}`,
                                              )}`
                                            : undefined
                                        }
                                      >
                                        <Button color="red">
                                          {
                                            strings.common.regions.normal[
                                              region
                                            ]
                                          }
                                        </Button>
                                      </Link>
                                    </Dialog.Close>
                                  ))}
                                </Flex>
                              </Flex>
                            </Dialog.Content>
                          </Dialog.Root>
                        )}
                      </Flex>
                    )}
                  </Popover.Content>
                </Popover.Root>
              </Flex>
            </Flex>
          </Flex>

          <ScrollArea>
            <Flex justify="center">
              <Grid
                columns="repeat(auto-fill, minmax(192px, 1fr))"
                flow="dense"
                gap="2"
                width="100%"
                p="3"
                pt="0"
              >
                {tools.map((tool) => (
                  <Flex
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
                ))}
              </Grid>
            </Flex>
          </ScrollArea>
        </Flex>
      </Flex>
    </Flex>
  );
}

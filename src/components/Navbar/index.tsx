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
  IconButton,
  Inset,
  Popover,
  Separator,
  Text,
} from '@radix-ui/themes';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { REGIONS } from '../../constants/regions';
import { TOOLS } from '../../constants/tools';
import { WARGAMING_APPLICATION_ID } from '../../constants/wargamingApplicationID';
import { imgur, ImgurSize } from '../../core/blitzkit/imgur';
import { patreonLoginUrl } from '../../core/blitzkit/patreonLoginUrl';
import { BlitzkitWide } from '../../icons/BlitzkitWide';
import { PatreonIcon } from '../../icons/Patreon';
import { WargamingIcon } from '../../icons/Wargaming';
import strings from '../../lang/en-US.json';
import { theme } from '../../stitches.config';
import * as App from '../../stores/app';
import { Link } from '../Link';
import * as styles from './index.css';

export const NAVBAR_HEIGHT = 64;

export default function Navbar() {
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const pathname = usePathname();
  const logins = App.use((state) => state.logins);
  const filteredTools = TOOLS.filter((tool) => !tool.href);
  const mutateApp = App.useMutation();

  return (
    <Box
      className={styles.navbar[showHamburgerMenu ? 'expanded' : 'collapsed']}
      style={{ zIndex: 3 }}
    >
      <Flex direction="column" align="center" pt="2">
        <Flex
          justify="between"
          align="center"
          style={{ maxWidth: 1024, width: '100%', padding: '0 16px' }}
          gap="8"
        >
          <Flex align="center" gap="4">
            <IconButton
              className={styles.hamburgerButton}
              size="4"
              variant="ghost"
              color="gray"
              onClick={() => setShowHamburgerMenu((state) => !state)}
            >
              {showHamburgerMenu ? <Cross1Icon /> : <HamburgerMenuIcon />}
            </IconButton>

            <Link
              onClick={() => setShowHamburgerMenu(false)}
              href="/"
              style={{
                color: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BlitzkitWide />
            </Link>
          </Flex>

          <Flex justify="center" gap="4" className={styles.toolTexts}>
            {filteredTools.map((tool) => {
              const selected = pathname.startsWith(`/tools/${tool.id}`);

              return (
                <Link
                  key={tool.id}
                  color="gray"
                  size="2"
                  highContrast={selected}
                  underline={selected ? 'always' : 'hover'}
                  href={`/tools/${tool.id}`}
                >
                  {tool.title}
                </Link>
              );
            })}
          </Flex>

          <Flex align="center" gap="4">
            <Link
              onClick={() => setShowHamburgerMenu(false)}
              href="https://discord.gg/nDt7AjGJQH"
              target="_blank"
              style={{
                color: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <DiscordLogoIcon width={16} height={16} />
            </Link>

            <Link
              onClick={() => setShowHamburgerMenu(false)}
              href="https://www.patreon.com/tresabhi"
              target="_blank"
              style={{
                color: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PatreonIcon width={14} height={14} />
            </Link>

            <Link
              href="/settings"
              onClick={() => setShowHamburgerMenu(false)}
              color="gray"
              highContrast
            >
              <Flex style={{ width: '100%', height: '100%' }} justify="center">
                <GearIcon />
              </Flex>
            </Link>

            <Popover.Root>
              <Popover.Trigger>
                <PersonIcon style={{ cursor: 'pointer' }} />
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
                      <Link style={{ width: '100%' }} href={patreonLoginUrl()}>
                        <Button style={{ width: '100%' }} color="tomato">
                          <PatreonIcon width={15} height={15} /> Patreon
                        </Button>
                      </Link>
                    )}

                    {!logins.wargaming && (
                      <Dialog.Root>
                        <Dialog.Trigger>
                          <Button color="red">
                            <WargamingIcon width={15} height={15} /> Wargaming
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
                                      {strings.common.regions.normal[region]}
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

        <Flex mt="6" gap="3" justify="center" wrap="wrap">
          {filteredTools.map((tool) => (
            <Link
              key={tool.id}
              href={`/tools/${tool.id}`}
              className={styles.toolCard}
              style={{
                backgroundImage: `url(${imgur(tool.image, {
                  format: 'jpeg',
                  size: ImgurSize.MediumThumbnail,
                })})`,
                cursor: tool.disabled ? 'default' : 'pointer',
                opacity: tool.disabled ? 0.25 : 1,
                height: 64,
                minWidth: 176,
                flex: 1,
                borderRadius: 8,
                textDecoration: 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-end',
                padding: 8,
                transition: `box-shadow ${theme.durations.regular}`,
              }}
              onClick={() => setShowHamburgerMenu(false)}
            >
              <Text
                style={{
                  color: theme.colors.textHighContrast,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {tool.title}
              </Text>
            </Link>
          ))}
        </Flex>
      </Flex>
    </Box>
  );
}

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
  Heading,
  IconButton,
  Link as LinkRadix,
  Popover,
  ScrollArea,
  Spinner,
  Text,
} from '@radix-ui/themes';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import * as styles from '../../app/page.css';
import { REGIONS, UNLOCALIZED_REGION_NAMES } from '../../constants/regions';
import { TOOLS } from '../../constants/tools';
import { authURL } from '../../core/blitz/authURL';
import { extendAuth } from '../../core/blitz/extendAuth';
import { logout } from '../../core/blitz/logout';
import { useWideFormat } from '../../hooks/useWideFormat';
import { BlitzkitWide } from '../../icons/BlitzkitWide';
import { PatreonIcon } from '../../icons/Patreon';
import { theme } from '../../stitches.config';
import { useApp } from '../../stores/app';
import { LoggedIn } from './components/LoggedIn';

export const NAVBAR_HEIGHT = 64;

export default function Navbar() {
  const wideFormat = useWideFormat(480);
  const login = useApp((state) => state.login);
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);

  useEffect(() => {
    if (!login) return;

    const expiresIn = login.expiresAt - Date.now() / 1000;
    const expiresInDays = expiresIn / 60 / 60 / 24;

    if (expiresInDays < 0) {
      logout();
    } else if (expiresInDays < 7) {
      extendAuth();
    }
  });

  const plugs = (
    <>
      <Link
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
    </>
  );

  return (
    <>
      <Box
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: showHamburgerMenu ? 176 : NAVBAR_HEIGHT + 1, // extra pixel for frost bleeding
          zIndex: 2,
          padding: '1rem',
          background: theme.colors.appBackground1_alpha,
          borderBottom: theme.borderStyles.nonInteractive,
          backdropFilter: 'blur(4rem)',
          boxSizing: 'border-box',
          transition: 'height 0.2s ease',
          overflow: 'hidden',
        }}
      >
        <Flex direction="column" align="center" pt="2">
          <Flex
            justify="between"
            align="center"
            style={{ maxWidth: 1600, width: '100%', padding: '0 16px' }}
            gap="4"
          >
            <IconButton
              variant="ghost"
              color="gray"
              onClick={() => setShowHamburgerMenu((state) => !state)}
            >
              {showHamburgerMenu ? <Cross1Icon /> : <HamburgerMenuIcon />}
            </IconButton>

            <Link
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

            <div style={{ flex: 1 }} />

            {wideFormat && plugs}

            <Link href="/settings">
              <Flex style={{ width: '100%', height: '100%' }} justify="center">
                <IconButton variant="ghost" color="gray">
                  <GearIcon />
                </IconButton>
              </Flex>
            </Link>

            {login && (
              <Popover.Root>
                <Popover.Trigger>
                  <IconButton variant="ghost" color="gray">
                    <PersonIcon />
                  </IconButton>
                </Popover.Trigger>

                <Popover.Content align="center">
                  <Flex direction="column" gap="2">
                    <Suspense fallback={<Spinner />}>
                      <LoggedIn />
                    </Suspense>
                  </Flex>
                </Popover.Content>
              </Popover.Root>
            )}

            {/* TODO: re-enable in the future */}
            {!login && false && (
              <Dialog.Root>
                <Dialog.Trigger>
                  <Button variant="ghost">Log in</Button>
                </Dialog.Trigger>

                <Dialog.Content
                  style={{
                    maxWidth: 360,
                  }}
                >
                  <Flex direction="column" gap="2" align="center">
                    <Heading size="3">Choose your region</Heading>

                    <Flex gap="4" align="center" justify="center" wrap="wrap">
                      {REGIONS.map((region) => (
                        <LinkRadix
                          key={region}
                          href={authURL(
                            region,
                            typeof window === 'undefined'
                              ? undefined
                              : location.href,
                          )}
                        >
                          {UNLOCALIZED_REGION_NAMES[region]}
                        </LinkRadix>
                      ))}
                    </Flex>
                  </Flex>
                </Dialog.Content>
              </Dialog.Root>
            )}
          </Flex>

          <ScrollArea scrollbars="horizontal">
            <Flex mt="6" gap="3" justify="center">
              {TOOLS.filter((tool) => !tool.href).map((tool) => (
                <Link
                  href={tool.href ?? `/tools/${tool.id}`}
                  target={tool.href ? '_blank' : undefined}
                  className={
                    tool.disabled ? styles.tool.disabled : styles.tool.enabled
                  }
                  style={{
                    backgroundImage: `url(/assets/banners/${tool.id}.webp)`,
                    cursor: tool.disabled ? 'default' : 'pointer',
                    opacity: tool.disabled ? 0.25 : 1,
                    height: 64,
                    width: 144,
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
                  onClick={(event) => {
                    if (tool.disabled) event.preventDefault();
                  }}
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
          </ScrollArea>
        </Flex>
      </Box>
    </>
  );
}

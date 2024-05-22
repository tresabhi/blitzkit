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
  Heading,
  IconButton,
  Link as LinkRadix,
  Popover,
  Spinner,
  Text,
} from '@radix-ui/themes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense, useState } from 'react';
import * as styles from '../../app/page.css';
import { REGIONS, UNLOCALIZED_REGION_NAMES } from '../../constants/regions';
import { TOOLS } from '../../constants/tools';
import { authURL } from '../../core/blitz/authURL';
import { useWideFormat } from '../../hooks/useWideFormat';
import { BlitzkitWide } from '../../icons/BlitzkitWide';
import { PatreonIcon } from '../../icons/Patreon';
import { theme } from '../../stitches.config';
import { useApp } from '../../stores/app';
import { LoggedIn } from './components/LoggedIn';

export const NAVBAR_HEIGHT = 64;

export default function Navbar() {
  const wideFormat = useWideFormat(688 - 32 - 64);
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const pathname = usePathname();
  const login = useApp((state) => state.login!);

  return (
    <Box
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        maxHeight:
          showHamburgerMenu && !wideFormat ? '100%' : NAVBAR_HEIGHT + 1,
        zIndex: 2,
        padding: '1rem',
        background: theme.colors.appBackground1_alpha,
        borderBottom: theme.borderStyles.nonInteractive,
        backdropFilter: 'blur(4rem)',
        WebkitBackdropFilter: 'blur(4rem)',
        boxSizing: 'border-box',
        transition: 'max-height 0.2s ease-in-out',
        overflow: 'hidden',
      }}
    >
      <Flex direction="column" align="center" pt="2">
        <Flex
          justify="between"
          align="center"
          style={{ maxWidth: 800, width: '100%', padding: '0 16px' }}
          gap="8"
        >
          <Flex align="center" gap="4">
            {!wideFormat && (
              <IconButton
                size="4"
                variant="ghost"
                color="gray"
                onClick={() => setShowHamburgerMenu((state) => !state)}
              >
                {showHamburgerMenu ? <Cross1Icon /> : <HamburgerMenuIcon />}
              </IconButton>
            )}

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

          {wideFormat && (
            <Flex justify="center" gap="4">
              {TOOLS.filter((tool) => !tool.href).map((tool) => {
                const selected = pathname.startsWith(`/tools/${tool.id}`);

                return (
                  <LinkRadix
                    highContrast={selected}
                    color="gray"
                    underline={selected ? 'always' : 'hover'}
                    href="#"
                    size="2"
                    onClick={(event) => event.preventDefault()}
                  >
                    <Link
                      style={{ all: 'inherit' }}
                      key={tool.id}
                      href={`/tools/${tool.id}`}
                    >
                      {tool.title}
                    </Link>
                  </LinkRadix>
                );
              })}
            </Flex>
          )}

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

            <Link href="/settings" onClick={() => setShowHamburgerMenu(false)}>
              <Flex style={{ width: '100%', height: '100%' }} justify="center">
                <IconButton size="4" variant="ghost" color="gray">
                  <GearIcon />
                </IconButton>
              </Flex>
            </Link>

            {login && (
              <Popover.Root>
                <Popover.Trigger>
                  <IconButton size="4" variant="ghost" color="gray">
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
                          onClick={() => setShowHamburgerMenu(false)}
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
        </Flex>

        <Flex mt="6" gap="3" justify="center" wrap="wrap">
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

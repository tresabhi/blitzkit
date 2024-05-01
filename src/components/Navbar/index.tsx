import {
  DiscordLogoIcon,
  GearIcon,
  HamburgerMenuIcon,
  PersonIcon,
} from '@radix-ui/react-icons';
import {
  Button,
  Flex,
  Heading,
  IconButton,
  Link as LinkRadix,
  Popover,
  Select,
  Spinner,
  Text,
} from '@radix-ui/themes';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { Region } from '../../constants/regions';
import { TOOLS } from '../../constants/tools';
import { authURL } from '../../core/blitz/authURL';
import { extendAuth } from '../../core/blitz/extendAuth';
import { logout } from '../../core/blitz/logout';
import { useFullScreen } from '../../hooks/useFullScreen';
import { BlitzkitWide } from '../../icons/BlitzkitWide';
import { PatreonIcon } from '../../icons/Patreon';
import { theme } from '../../stitches.config';
import { useApp } from '../../stores/app';
import { LoggedIn } from './components/LoggedIn';

export default function Navbar() {
  const isFullScreen = useFullScreen();
  const login = useApp((state) => state.login);
  const [region, setRegion] = useState<Region>('com');

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

  if (isFullScreen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: 64 + 1, // extra pixel for frost bleeding
        zIndex: 1,
        padding: '1rem',
        background: theme.colors.appBackground1_alpha,
        borderBottom: theme.borderStyles.nonInteractive,
        backdropFilter: 'blur(4rem)',
        boxSizing: 'border-box',
      }}
    >
      <Flex
        justify="center"
        style={{
          height: '100%',
        }}
      >
        <Flex
          justify="between"
          align="center"
          style={{ maxWidth: 800, width: '100%', padding: '0 16px' }}
          gap="4"
        >
          {/* {wideFormat ? (
            <EverythingSearch style={{ flex: 1 }} />
          ) : (
            <div style={{ flex: 1 }} />
          )}
          
          {!wideFormat && (
            <IconButton variant="ghost" color="gray">
              <MagnifyingGlassIcon />
            </IconButton>
          )} */}

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
          <div style={{ width: 14, height: 14 }} />

          <div style={{ flex: 1 }} />

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

          <Link href="/settings">
            <Flex style={{ width: '100%', height: '100%' }} justify="center">
              <IconButton variant="ghost" color="gray">
                <GearIcon />
              </IconButton>
            </Flex>
          </Link>

          <Popover.Root>
            <Popover.Trigger>
              <IconButton variant="ghost" color="gray">
                <HamburgerMenuIcon />
              </IconButton>
            </Popover.Trigger>

            <Popover.Content align="center">
              <Flex direction="column" gap="2">
                <Heading size="4">Tools</Heading>

                <Flex direction="column" gap="1" pl="4">
                  {TOOLS.map((tool, index) => {
                    if (tool.href || tool.disabled) return null;

                    return (
                      <LinkRadix
                        key={tool.id}
                        tabIndex={-1}
                        href={`/tools/${tool.id}`}
                        onClick={(event) => event.preventDefault()}
                      >
                        <Link
                          href={`/tools/${tool.id}`}
                          key={index}
                          style={{
                            textDecoration: 'none',
                            color: 'inherit',
                          }}
                        >
                          {tool.title}
                        </Link>
                      </LinkRadix>
                    );
                  })}
                </Flex>
              </Flex>
            </Popover.Content>
          </Popover.Root>

          <Popover.Root>
            <Popover.Trigger>
              <IconButton variant="ghost" color="gray">
                <PersonIcon />
              </IconButton>
            </Popover.Trigger>

            <Popover.Content align="center">
              <Flex direction="column" gap="2">
                {login && (
                  <Suspense fallback={<Spinner />}>
                    <LoggedIn />
                  </Suspense>
                )}

                {!login && (
                  <>
                    <Text color="gray">Currently signed out</Text>

                    <Flex gap="2">
                      <Select.Root
                        value={region}
                        onValueChange={(value) => setRegion(value as Region)}
                      >
                        <Select.Trigger />
                        <Select.Content>
                          <Select.Item value={'com' satisfies Region}>
                            North America
                          </Select.Item>
                          <Select.Item value={'eu' satisfies Region}>
                            Europe
                          </Select.Item>
                          <Select.Item value={'asia' satisfies Region}>
                            Asia
                          </Select.Item>
                        </Select.Content>
                      </Select.Root>

                      <LinkRadix href={authURL(region)}>
                        <Button>Sign in</Button>
                      </LinkRadix>
                    </Flex>
                  </>
                )}
              </Flex>
            </Popover.Content>
          </Popover.Root>
        </Flex>
      </Flex>
    </div>
  );
}

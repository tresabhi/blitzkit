import {
  DiscordLogoIcon,
  GearIcon,
  HamburgerMenuIcon,
  PersonIcon,
} from '@radix-ui/react-icons';
import {
  Button,
  Dialog,
  Flex,
  Heading,
  IconButton,
  Link as LinkRadix,
  Popover,
  Spinner,
} from '@radix-ui/themes';
import Link from 'next/link';
import { Suspense, useEffect } from 'react';
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

export default function Navbar() {
  const wideFormat = useWideFormat(480);
  const login = useApp((state) => state.login);

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
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: 64 + 1, // extra pixel for frost bleeding
        zIndex: 2,
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
          <Popover.Root>
            <Popover.Trigger>
              <IconButton variant="ghost" color="gray">
                <HamburgerMenuIcon />
              </IconButton>
            </Popover.Trigger>

            <Popover.Content>
              <Flex direction="column" gap="4">
                {!wideFormat && <Flex gap="2">{plugs}</Flex>}

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
              </Flex>
            </Popover.Content>
          </Popover.Root>

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
      </Flex>
    </div>
  );
}

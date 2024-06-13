import {
  Cross1Icon,
  DiscordLogoIcon,
  GearIcon,
  HamburgerMenuIcon,
  PersonIcon,
} from '@radix-ui/react-icons';
import { Box, Button, Flex, IconButton, Popover, Text } from '@radix-ui/themes';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { TOOLS } from '../../constants/tools';
import { BlitzkitWide } from '../../icons/BlitzkitWide';
import { PatreonIcon } from '../../icons/Patreon';
import { WargamingIcon } from '../../icons/Wargaming';
import { theme } from '../../stitches.config';
import { useApp } from '../../stores/app';
import { Link } from '../Link';
import * as styles from './index.css';

export const NAVBAR_HEIGHT = 64;

export default function Navbar() {
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const pathname = usePathname();
  const logins = useApp((state) => state.logins);

  return (
    <Box
      className={styles.navbar[showHamburgerMenu ? 'expanded' : 'collapsed']}
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
            {TOOLS.filter((tool) => !tool.href).map((tool) => {
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

              <Popover.Content align="end" width="320px">
                <Flex direction="column" gap="2">
                  <Text align="center">Log in with...</Text>

                  <Link
                    style={{ width: '100%' }}
                    href={`https://www.patreon.com/oauth2/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_PATREON_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_PATREON_REDIRECT_URI}`}
                  >
                    <Button style={{ width: '100%' }} color="tomato">
                      <PatreonIcon width={15} height={15} /> Patreon
                    </Button>
                  </Link>
                  <Button color="red">
                    <WargamingIcon width={15} height={15} /> Wargaming
                  </Button>
                </Flex>
              </Popover.Content>
            </Popover.Root>
          </Flex>
        </Flex>

        <Flex mt="6" gap="3" justify="center" wrap="wrap">
          {TOOLS.filter((tool) => !tool.href).map((tool) => (
            <Link
              key={tool.id}
              href={`/tools/${tool.id}`}
              className={styles.toolCard}
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

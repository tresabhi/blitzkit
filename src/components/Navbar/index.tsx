import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import { Flex, IconButton } from '@radix-ui/themes';
import Link from 'next/link';
import { useFullScreen } from '../../hooks/useFullScreen';
import { BlitzkriegWormWide } from '../../icons/BlitzkriegWormWide';
import { theme } from '../../stitches.config';
import { EverythingSearch } from './components/EverythingSearch';

export default function Navbar() {
  const isFullScreen = useFullScreen();
  // const pathName = usePathname();

  if (isFullScreen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 1,
        padding: '1rem',
        background: theme.colors.appBackground1_alpha,
        borderBottom: theme.borderStyles.nonInteractive,
        backdropFilter: 'blur(4rem)',
        boxSizing: 'border-box',
      }}
    >
      <Flex justify="center">
        <Flex
          justify="between"
          align="center"
          style={{ maxWidth: 800, width: '100%', padding: '0 16px' }}
          gap="4"
        >
          <Link
            href="/"
            style={{
              color: 'inherit',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BlitzkriegWormWide />
          </Link>

          <EverythingSearch style={{ flex: 1 }} />

          <IconButton variant="ghost">
            <HamburgerMenuIcon />
          </IconButton>

          {/* <Flex justify="center" align="center" gap="4">
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
              href="https://ko-fi.com/tresabhi"
              target="_blank"
              style={{
                color: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src="https://i.imgur.com/QdqgdP2.png"
                style={{
                  width: 20,
                  height: 20,
                  objectFit: 'contain',
                }}
              />
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
          </Flex> */}
        </Flex>
      </Flex>
    </div>
  );
}

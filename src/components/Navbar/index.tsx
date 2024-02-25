import { DiscordLogoIcon } from '@radix-ui/react-icons';
import { Flex, Text, Theme } from '@radix-ui/themes';
import Link from 'next/link';
import { theme } from '../../stitches.config';
import { BlitzkriegWormWide } from '../../icons/BlitzkriegWormWide';

export default function Navbar() {
  return (
    <Theme radius="none">
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
          >
            <Flex justify="center" align="center" gap="2">
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
              <Text size="2">❤️</Text>
              <Text size="2">
                <Link
                  href="https://tresabhi.github.io/"
                  style={{ color: 'inherit', textDecoration: 'none' }}
                  target="_blank"
                >
                  by TrèsAbhi
                </Link>
              </Text>
            </Flex>

            <Flex justify="center" align="center" gap="2">
              <Link
                href="https://discord.gg/nDt7AjGJQH"
                style={{
                  color: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <DiscordLogoIcon />
              </Link>
            </Flex>
          </Flex>
        </Flex>
      </div>
    </Theme>
  );
}

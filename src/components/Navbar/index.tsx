import { DiscordLogoIcon } from '@radix-ui/react-icons';
import { Card, Flex, Text, Theme } from '@radix-ui/themes';
import Link from 'next/link';
import { BlitzkriegWormWide } from '../BlitzkriegWormWide';

export default function Navbar() {
  return (
    <Theme radius="none">
      <Card
        style={{
          borderLeft: 'none',
          borderTop: 'none',
          borderRight: 'none',
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
      </Card>
    </Theme>
  );
}

import {
  DiscordLogoIcon,
  GearIcon,
  HamburgerMenuIcon,
} from '@radix-ui/react-icons';
import {
  Flex,
  Heading,
  IconButton,
  Link as LinkRadix,
  Popover,
} from '@radix-ui/themes';
import Link from 'next/link';
import { TOOLS } from '../../constants/tools';
import { useFullScreen } from '../../hooks/useFullScreen';
import { useWideFormat } from '../../hooks/useWideFormat';
import { BlitzkriegWormWide } from '../../icons/BlitzkriegWormWide';
import { PatreonIcon } from '../../icons/Patreon';
import { theme } from '../../stitches.config';

export default function Navbar() {
  const isFullScreen = useFullScreen();
  const wideFormat = useWideFormat(600);

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
            <BlitzkriegWormWide />
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
        </Flex>
      </Flex>
    </div>
  );
}

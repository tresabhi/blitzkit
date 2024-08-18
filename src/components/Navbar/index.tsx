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
  Flex,
  Grid,
  IconButton,
  ScrollArea,
  Separator,
  Text,
} from '@radix-ui/themes';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { TOOLS } from '../../constants/tools';
import { imgur, ImgurSize } from '../../core/blitzkit/imgur';
import { PatreonIcon } from '../../icons/Patreon';
import * as App from '../../stores/app';
import { Link } from '../Link';
import * as styles from './index.css';

export default function Navbar() {
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const pathname = usePathname();
  const logins = App.use((state) => state.logins);
  const mutateApp = App.useMutation();

  return (
    <Flex
      direction="column"
      position="sticky"
      top="0"
      className={styles.navbar[`${showHamburgerMenu}`]}
      overflow="hidden"
    >
      <Flex justify="center">
        <Flex flexGrow="1" maxWidth="1024px" p="3" align="center">
          <Flex gap="3" align="center">
            <IconButton
              variant="ghost"
              color="gray"
              className={styles.hamburger}
              onClick={() => setShowHamburgerMenu((state) => !state)}
            >
              {showHamburgerMenu ? <Cross1Icon /> : <HamburgerMenuIcon />}
            </IconButton>

            <Link
              color="gray"
              highContrast
              href="/"
              underline="hover"
              weight="bold"
              onClick={() => setShowHamburgerMenu(false)}
            >
              BlitzKit
            </Link>
          </Flex>

          <Box flexGrow="1" />

          <Flex
            align="center"
            gap="2"
            justify="center"
            className={styles.tools}
          >
            {TOOLS.map((tool, index) => {
              const selected = pathname.startsWith(`/tools/${tool.id}`);

              return (
                <>
                  {index > 0 && <Separator orientation="vertical" size="1" />}
                  <Link
                    color="gray"
                    highContrast={selected}
                    size="2"
                    href={`tools/${tool.id}`}
                    key={tool.title}
                    underline={selected ? 'always' : 'hover'}
                  >
                    {tool.title}
                  </Link>
                </>
              );
            })}
          </Flex>

          <Box flexGrow="1" />

          <Flex align="center" gap="3">
            <Link
              style={{ display: 'flex', alignContent: 'center' }}
              color="gray"
              href="https://discord.gg/nDt7AjGJQH"
              underline="none"
              target="_blank"
              onClick={() => setShowHamburgerMenu(false)}
            >
              <DiscordLogoIcon />
            </Link>
            <Link
              style={{ display: 'flex', alignContent: 'center' }}
              color="gray"
              href="https://discord.gg/nDt7AjGJQH"
              underline="none"
              target="_blank"
              onClick={() => setShowHamburgerMenu(false)}
            >
              <PatreonIcon width="0.75em" height="0.75em" />
            </Link>
            <Link
              style={{ display: 'flex', alignContent: 'center' }}
              color="gray"
              href="/settings"
              underline="none"
              target="_blank"
              onClick={() => setShowHamburgerMenu(false)}
            >
              <GearIcon />
            </Link>
            <IconButton variant="ghost" color="gray">
              <PersonIcon />
            </IconButton>
          </Flex>
        </Flex>
      </Flex>

      <ScrollArea>
        <Flex justify="center">
          <Grid
            columns="repeat(auto-fill, minmax(128px, 1fr))"
            flow="dense"
            gap="2"
            width="100%"
            p="4"
            pt="0"
          >
            {TOOLS.map((tool) => (
              <Flex
                style={{
                  position: 'relative',
                  borderRadius: 'var(--radius-2)',
                  overflow: 'hidden',
                  backgroundImage: `url(${imgur(tool.image, { format: 'jpeg', size: ImgurSize.LargeThumbnail })})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  aspectRatio: '4 / 3',
                }}
                onClick={() => setShowHamburgerMenu(false)}
              >
                <Link
                  href={`/tools/${tool.id}`}
                  style={{
                    display: 'flex',
                    width: '100%',
                    height: '100%',
                    flexDirection: 'column',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <Box
                    flexGrow="1"
                    style={{
                      backgroundImage: `url(${imgur(tool.image, { format: 'jpeg', size: ImgurSize.LargeThumbnail })})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />

                  <Flex
                    p="2"
                    align="center"
                    width="100%"
                    direction={{
                      initial: 'column',
                      sm: 'row',
                    }}
                    style={{
                      backgroundColor: 'var(--color-panel-translucent)',
                      backdropFilter: 'blur(4rem)',
                      WebkitBackdropFilter: 'blur(4rem)',
                    }}
                  >
                    <Text weight="medium">{tool.title}</Text>
                  </Flex>
                </Link>
              </Flex>
            ))}
          </Grid>
        </Flex>
      </ScrollArea>
    </Flex>
  );
}

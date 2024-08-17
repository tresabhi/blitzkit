'use client';

import {
  DiscordLogoIcon,
  GearIcon,
  HamburgerMenuIcon,
  PersonIcon,
} from '@radix-ui/react-icons';
import { Box, Flex, IconButton, Separator } from '@radix-ui/themes';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { TOOLS } from '../../constants/tools';
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
      justify="center"
      position="sticky"
      top="0"
      style={{
        // 1px overlap with content to bleed color
        marginBottom: -1,
        backdropFilter: 'blur(4rem) brightness(0.75)',
        WebkitBackdropFilter: 'blur(4rem) brightness(0.75)',
        zIndex: 1,
      }}
    >
      <Flex flexGrow="1" maxWidth="1024px" p="2" align="center">
        <Flex gap="3" align="center">
          <IconButton variant="ghost" color="gray" className={styles.hamburger}>
            <HamburgerMenuIcon />
          </IconButton>

          <Link
            color="gray"
            highContrast
            href="/"
            underline="hover"
            weight="bold"
          >
            BlitzKit
          </Link>
        </Flex>

        <Box flexGrow="1" />

        <Flex align="center" gap="2" justify="center" className={styles.tools}>
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
          >
            <DiscordLogoIcon />
          </Link>
          <Link
            style={{ display: 'flex', alignContent: 'center' }}
            color="gray"
            href="https://discord.gg/nDt7AjGJQH"
            underline="none"
            target="_blank"
          >
            <PatreonIcon width="0.75em" height="0.75em" />
          </Link>
          <Link
            style={{ display: 'flex', alignContent: 'center' }}
            color="gray"
            href="/settings"
            underline="none"
            target="_blank"
          >
            <GearIcon />
          </Link>
          <IconButton variant="ghost" color="gray">
            <PersonIcon />
          </IconButton>
        </Flex>
      </Flex>
    </Flex>
  );
}

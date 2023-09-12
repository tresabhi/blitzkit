'use client';

import { CaretRightIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { useRef } from 'react';
import { Search, SearchItem } from 'react-fuzzysort';
import { SearchBar } from '../components/SearchBar';
import { theme } from '../stitches.config';
import * as styles from './page.css';

const TOOLS = [
  {
    title: 'Ratings',
    description: 'Current and old season leader boards',
    banner: '/assets/banners/ratings.png',
    href: '/tools/ratings',
  },
  {
    title: 'Tankopedia',
    description: 'Full Blitz tank encyclopedia',
    banner: '/assets/banners/tank.png',
    href: '/tools/tankopedia',
  },
  {
    title: 'Inactivity tracker',
    description: 'Find inactive members of a clan',
    banner: '/assets/banners/inactive.png',
    href: '/tools/inactive',
  },
  {
    title: 'Player profile',
    description: "A player's basic non-statistical info",
    banner: '/assets/banners/player.png',
    href: '/tools/profile',
  },
  {
    title: 'More coming soon',
    description: 'New tools are added often',
    banner: '/assets/banners/more.png',
    href: 'https://discord.gg/nDt7AjGJQH',
  },
];

export default function Page() {
  const input = useRef<HTMLInputElement>(null);

  return (
    <div
      style={{
        width: '100%',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        boxSizing: 'border-box',
      }}
    >
      <SearchBar ref={input} />

      <div
        style={{
          display: 'flex',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <Search
          input={input}
          list={TOOLS.map(
            (tool) =>
              ({
                node: (
                  <Link
                    href={tool.href}
                    className={styles.tool}
                    style={{
                      backgroundImage: `url(${tool.banner})`,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 32,
                        color: theme.colors.textHighContrast,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {tool.title}
                      <CaretRightIcon style={{ width: '1em', height: '1em' }} />
                    </span>
                    <span
                      style={{
                        color: theme.colors.textLowContrast,
                        fontSize: 16,
                      }}
                    >
                      {tool.description}
                    </span>
                  </Link>
                ),
                query: `${tool.title} ${tool.description}`,
              }) satisfies SearchItem,
          )}
        />
      </div>
    </div>
  );
}

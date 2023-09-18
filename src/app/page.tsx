'use client';

import { CaretRightIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { useRef } from 'react';
import { Search, SearchItem } from 'react-fuzzysort';
import PageWrapper from '../components/PageWrapper';
import { SearchBar } from '../components/SearchBar';
import { theme } from '../stitches.config';
import * as styles from './page.css';

export const TOOLS = [
  {
    id: 'session',
    title: 'Session tracker',
    description: 'Track your performance in a session',
  },
  {
    id: 'ratings',
    title: 'Ratings',
    description: 'Current and old season leader boards',
  },
  {
    id: 'tankopedia',
    title: 'Tankopedia',
    description: 'Full Blitz tank encyclopedia',
  },
  {
    id: 'inactive',
    title: 'Inactivity tracker',
    description: 'Find inactive members of a clan',
  },
  {
    id: 'profile',
    title: 'Player profile',
    description: "A player's basic non-statistical info",
  },
  // {
  //   title: 'More coming soon',
  //   description: 'New tools are added often',
  //   banner: '/assets/banners/more.png',
  //   id: 'https://discord.gg/nDt7AjGJQH',
  // },
];

export default function Page() {
  const input = useRef<HTMLInputElement>(null);

  return (
    <PageWrapper>
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
                      href={`/tools/${tool.id}`}
                      className={styles.tool}
                      style={{
                        backgroundImage: `url(/assets/banners/${tool.id}.png)`,
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
                        <CaretRightIcon
                          style={{ width: '1em', height: '1em' }}
                        />
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
    </PageWrapper>
  );
}

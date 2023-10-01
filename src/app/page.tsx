'use client';

import { CaretRightIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { TextField } from '@radix-ui/themes';
import Link from 'next/link';
import { useRef } from 'react';
import { Search, SearchItem } from 'react-fuzzysort';
import PageWrapper from '../components/PageWrapper';
import { TOOLS } from '../constants/tools';
import { theme } from '../stitches.config';
import * as styles from './page.css';

export default function Page() {
  const input = useRef<HTMLInputElement>(null);

  return (
    <PageWrapper>
      <TextField.Root>
        <TextField.Slot>
          <MagnifyingGlassIcon height="16" width="16" />
        </TextField.Slot>
        <TextField.Input ref={input} placeholder="Search tools..." />
      </TextField.Root>

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
    </PageWrapper>
  );
}

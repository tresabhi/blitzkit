'use client';

import { CopyIcon, ListBulletIcon, ReloadIcon } from '@radix-ui/react-icons';
import { debounce } from 'lodash';
import { ChangeEvent, useRef, useState } from 'react';
import { Button } from '../../../components/Button';
import PageWrapper from '../../../components/PageWrapper';
import { SearchBar } from '../../../components/SearchBar';
import { REGION_NAMES } from '../../../constants/regions';
import { AccountListWithServer } from '../../../core/blitz/listPlayers';
import { theme } from '../../../stitches.config';
import * as styles from './page.css';

export default function Page() {
  const input = useRef<HTMLInputElement>(null);
  const [searchResults, setSearchResults] = useState<
    AccountListWithServer | undefined
  >(undefined);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const handleChange = debounce(
    async (event: ChangeEvent<HTMLInputElement>) => {
      if (event.target.value) {
        const players = await fetch(
          `/api/list/players?search=${event.target.value}`,
        ).then((response) => response.json() as Promise<AccountListWithServer>);

        setSearchResults(players);
      } else {
        // TODO
      }
    },
    500,
  );

  return (
    <PageWrapper>
      <div className={styles.toolBar}>
        <div style={{ flex: 1, boxSizing: 'border-box', position: 'relative' }}>
          <SearchBar
            ref={input}
            style={{ width: '100%', boxSizing: 'border-box' }}
            onChange={(event) => {
              if (event.target.value) {
                setShowSearchResults(true);
                setSearchResults(undefined);
              } else {
                setShowSearchResults(false);
              }

              handleChange(event);
            }}
            placeholder="Search for a player..."
          />

          {showSearchResults && (
            <div
              style={{
                display: 'flex',
                position: 'absolute',
                width: '100%',
                top: '100%',
                marginTop: 8,
                flexDirection: 'column',
                backgroundColor: theme.colors.componentNonInteractive,
                border: theme.borderStyles.nonInteractive,
                borderRadius: 4,
                padding: 8,
                boxSizing: 'border-box',
              }}
            >
              {searchResults === undefined ? (
                <div
                  style={{
                    display: 'flex',
                    alignContent: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    color: theme.colors.textLowContrast,
                  }}
                >
                  Searching...
                </div>
              ) : searchResults.length === 0 ? (
                <div
                  style={{
                    display: 'flex',
                    alignContent: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    color: theme.colors.textLowContrast,
                  }}
                >
                  No results
                </div>
              ) : (
                searchResults?.map(({ account_id, nickname, region }) => (
                  <button
                    key={account_id}
                    className={styles.searchButton}
                    onClick={() => {
                      setShowSearchResults(false);
                      if (input.current) input.current.value = nickname;
                    }}
                  >
                    <span
                      style={{
                        color: theme.colors.textHighContrast,
                      }}
                    >
                      {nickname}
                    </span>
                    <span
                      style={{
                        color: theme.colors.textLowContrast,
                      }}
                    >
                      {REGION_NAMES[region]}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <Button className={styles.toolbarButton} color="dangerous">
            <ReloadIcon /> Reset
          </Button>
          <Button className={styles.toolbarButton}>
            <CopyIcon /> Embed
          </Button>
          <Button className={styles.toolbarButton}>
            <ListBulletIcon /> Options
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
}

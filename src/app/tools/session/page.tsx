'use client';

import { CopyIcon, ListBulletIcon, ReloadIcon } from '@radix-ui/react-icons';
import { debounce } from 'lodash';
import { ChangeEvent, useRef } from 'react';
import { Button } from '../../../components/Button';
import PageWrapper from '../../../components/PageWrapper';
import { SearchBar } from '../../../components/SearchBar';
import { AccountListWithServer } from '../../../core/blitz/listPlayers';
import * as styles from './page.css';

export default function Page() {
  const input = useRef<HTMLInputElement>(null);
  const handleChange = debounce(
    async (event: ChangeEvent<HTMLInputElement>) => {
      if (event.target.value) {
        const players = await fetch(
          `/api/list/players?search=${event.target.value}`,
        ).then((response) => response.json() as Promise<AccountListWithServer>);

        console.log(
          players
            .map((player) => `${player.region} - ${player.nickname}`)
            .join('\n'),
        );
      } else {
        // TODO
      }
    },
    500,
  );

  return (
    <PageWrapper>
      <div className={styles.toolBar}>
        <SearchBar
          ref={input}
          onChange={handleChange}
          style={{ flex: 1 }}
          placeholder="Search for a player..."
        />

        <div style={{ display: 'flex', gap: 8 }}>
          <Button className={styles.button} color="dangerous">
            <ReloadIcon /> Reset
          </Button>
          <Button className={styles.button}>
            <CopyIcon /> Embed
          </Button>
          <Button className={styles.button}>
            <ListBulletIcon /> Options
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
}

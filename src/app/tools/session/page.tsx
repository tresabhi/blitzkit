'use client';

import { CopyIcon, ListBulletIcon, ReloadIcon } from '@radix-ui/react-icons';
import { Button } from '../../../components/Button';
import PageWrapper from '../../../components/PageWrapper';
import { SearchBar } from '../../../components/SearchBar';
import * as styles from './page.css';

export default function Page() {
  return (
    <PageWrapper>
      <div className={styles.toolBar}>
        <SearchBar style={{ flex: 1 }} placeholder="Search for a player..." />

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

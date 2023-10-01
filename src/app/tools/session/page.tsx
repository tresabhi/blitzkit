'use client';

import { CopyIcon, ReloadIcon } from '@radix-ui/react-icons';
import { debounce } from 'lodash';
import { ChangeEvent, useRef, useState } from 'react';
import { Button } from '../../../components/Button';
import PageWrapper from '../../../components/PageWrapper';
import { SearchBar } from '../../../components/SearchBar';
import { REGION_NAMES, Region } from '../../../constants/regions';
import { WARGAMING_APPLICATION_ID } from '../../../constants/wargamingApplicationID';
import getWargamingResponse from '../../../core/blitz/getWargamingResponse';
import listPlayers, {
  AccountListWithServer,
} from '../../../core/blitz/listPlayers';
import { theme } from '../../../stitches.config';
import { useSession } from '../../../stores/session';
import { NormalizedTankStats, TanksStats } from '../../../types/tanksStats';
import SessionPage from '../../embeds/session/page';
import * as styles from './page.css';

// 1 once per 5 seconds

export default function Page() {
  const input = useRef<HTMLInputElement>(null);
  const [searchResults, setSearchResults] = useState<
    AccountListWithServer | undefined
  >(undefined);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const handleChange = debounce(
    async (event: ChangeEvent<HTMLInputElement>) => {
      if (event.target.value) {
        setSearchResults(await listPlayers(event.target.value));
      } else {
        setSearchResults(undefined);
        setShowSearchResults(false);
      }
    },
    500,
  );
  const session = useSession();

  async function setSession(region: Region, id: number, nickname: string) {
    input.current!.value = nickname;

    const rawTankStats = (
      await getWargamingResponse<TanksStats>(
        `https://api.wotblitz.${region}/wotb/tanks/stats/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${id}`,
      )
    )[id];
    const tankStats = rawTankStats.reduce<NormalizedTankStats>(
      (accumulator, tank) => ({
        ...accumulator,
        [tank.tank_id]: tank,
      }),
      {},
    );

    useSession.setState({
      isTracking: true,
      id,
      region,
      nickname,
      tankStats,
      time: Date.now(),
    });
  }

  return (
    <PageWrapper>
      <div className={styles.toolBar}>
        <div style={{ flex: 1, boxSizing: 'border-box', position: 'relative' }}>
          <SearchBar
            ref={input}
            style={{ width: '100%', boxSizing: 'border-box' }}
            defaultValue={session.isTracking ? session.nickname : undefined}
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
                searchResults?.map(({ account_id: id, nickname, region }) => (
                  <button
                    key={id}
                    className={styles.searchButton}
                    onClick={() => {
                      setShowSearchResults(false);
                      setSession(region, id, nickname);
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
          <Button
            className={styles.toolbarButton}
            color="dangerous"
            onClick={async () => {
              const session = useSession.getState();

              if (!session.isTracking) return;

              setSession(session.region, session.id, session.nickname);
            }}
          >
            <ReloadIcon /> Reset
          </Button>
          <Button
            className={styles.toolbarButton}
            onClick={() =>
              navigator.clipboard.writeText(`${location.origin}/embeds/session`)
            }
          >
            <CopyIcon /> Embed
          </Button>
        </div>
      </div>

      <SessionPage />
    </PageWrapper>
  );
}

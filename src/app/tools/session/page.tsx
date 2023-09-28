'use client';

import { CopyIcon, ListBulletIcon, ReloadIcon } from '@radix-ui/react-icons';
import { debounce } from 'lodash';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import * as Breakdown from '../../../components/Breakdown';
import { Button } from '../../../components/Button';
import PageWrapper from '../../../components/PageWrapper';
import { SearchBar } from '../../../components/SearchBar';
import { TreeTypeEnum } from '../../../components/Tanks';
import { REGION_NAMES, Region } from '../../../constants/regions';
import { WARGAMING_APPLICATION_ID } from '../../../constants/wargamingApplicationID';
import calculateWN8 from '../../../core/blitz/calculateWN8';
import { diffNormalizedTankStats } from '../../../core/blitz/diffNormalizedTankStats';
import getWN8Percentile from '../../../core/blitz/getWN8Percentile';
import getWargamingResponse from '../../../core/blitz/getWargamingResponse';
import listPlayers, {
  AccountListWithServer,
} from '../../../core/blitz/listPlayers';
import { TankopediaEntry, tankopedia } from '../../../core/blitz/tankopedia';
import { tankAverages } from '../../../core/blitzstars/tankAverages';
import { theme } from '../../../stitches.config';
import { useSession } from '../../../stores/session';
import {
  IndividualTankStats,
  NormalizedTankStats,
  TanksStats,
} from '../../../types/tanksStats';
import * as styles from './page.css';

// 1 once per 5 seconds
const REFRESH_RATE = 1 / 5;

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
  const tankStatsArray = session.isTracking
    ? (Object.values(session.tankStats) as IndividualTankStats[])
    : [];
  const since = session.isTracking ? new Date(session.time) : undefined;
  const [diff, setDiff] = useState<
    | {
        careerWN8: number;

        list: {
          stats: IndividualTankStats;
          tankopedia?: TankopediaEntry;
          career: IndividualTankStats;
          currentWN8?: number;
          careerWN8?: number;
        }[];
      }
    | undefined
  >(undefined);

  async function recalculateDiff() {
    if (session.isTracking) {
      const { id, region } = session;
      const careerRaw = await getWargamingResponse<TanksStats>(
        `https://api.wotblitz.${region}/wotb/tanks/stats/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${id}`,
      );
      const career = careerRaw[id].reduce<Record<number, IndividualTankStats>>(
        (accumulator, curr) => ({
          ...accumulator,
          [curr.tank_id]: curr,
        }),
        {},
      );
      const awaitedTankopedia = await tankopedia;
      const awaitedTankAverages = await tankAverages;
      const careerWN8 =
        careerRaw[id].reduce(
          (accumulator, { tank_id, all }) =>
            accumulator +
            (awaitedTankAverages[tank_id] && all.battles > 0
              ? all.battles *
                calculateWN8(awaitedTankAverages[tank_id].all, all)
              : 0),
          0,
        ) /
        careerRaw[id].reduce(
          (accumulator, { tank_id, all }) =>
            accumulator +
            (awaitedTankAverages[tank_id] && all.battles > 0 ? all.battles : 0),
          0,
        );

      setDiff({
        careerWN8,

        list: (
          Object.values(
            diffNormalizedTankStats(session.tankStats, career),
          ) as IndividualTankStats[]
        ).map((stats) => {
          return {
            stats,
            tankopedia: awaitedTankopedia[stats.tank_id],
            career: career[stats.tank_id],
            currentWN8: awaitedTankAverages[stats.tank_id]
              ? calculateWN8(awaitedTankAverages[stats.tank_id].all, stats.all)
              : undefined,
            careerWN8: awaitedTankAverages[stats.tank_id]
              ? calculateWN8(
                  awaitedTankAverages[stats.tank_id].all,
                  career[stats.tank_id].all,
                )
              : undefined,
          };
        }),
      });
    }
  }
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
    });

    recalculateDiff();
  }

  useEffect(() => {
    recalculateDiff();
    const interval = setInterval(recalculateDiff, 1000 / REFRESH_RATE);

    return () => clearInterval(interval);
  }, []);

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
          <Button className={styles.toolbarButton}>
            <CopyIcon /> Embed
          </Button>
          <Button className={styles.toolbarButton}>
            <ListBulletIcon /> Options
          </Button>
        </div>
      </div>

      <Breakdown.Root>
        {session.isTracking && since !== undefined && diff !== undefined && (
          <Breakdown.Row
            title={`Since ${since.toLocaleString(undefined, {
              hour: 'numeric',
              minute: 'numeric',
              hour12: true,
              month: 'short',
              year: 'numeric',
              day: 'numeric',
            })}`}
            stats={[
              {
                title: 'Battles',
                current: diff.list
                  .reduce(
                    (accumulator, { stats }) => accumulator + stats.all.battles,
                    0,
                  )
                  .toLocaleString(),
                career: tankStatsArray
                  .reduce(
                    (accumulator, stats) => accumulator + stats.all.battles,
                    0,
                  )
                  .toLocaleString(),
              },
              {
                title: 'Winrate',
                current: `${(
                  100 *
                  (diff.list.reduce(
                    (accumulator, { stats }) => accumulator + stats.all.wins,
                    0,
                  ) /
                    diff.list.reduce(
                      (accumulator, { stats }) =>
                        accumulator + stats.all.battles,
                      0,
                    ))
                ).toFixed(2)}%`,
                career: `${(
                  100 *
                  (tankStatsArray.reduce(
                    (accumulator, stats) => accumulator + stats.all.wins,
                    0,
                  ) /
                    tankStatsArray.reduce(
                      (accumulator, stats) => accumulator + stats.all.battles,
                      0,
                    ))
                ).toFixed(2)}%`,
              },
              (() => {
                const currentWN8 =
                  diff.list.reduce(
                    (accumulator, { currentWN8, stats }) =>
                      stats.all.battles * (currentWN8 ?? 0) + accumulator,
                    0,
                  ) /
                  diff.list.reduce(
                    (accumulator, { currentWN8, stats }) =>
                      (currentWN8 === undefined ? 0 : stats.all.battles) +
                      accumulator,
                    0,
                  );

                return {
                  title: 'WN8',
                  current: Math.round(currentWN8).toLocaleString(),
                  percentile: getWN8Percentile(currentWN8),
                  career: Math.round(diff.careerWN8).toLocaleString(),
                };
              })(),
              {
                title: 'Damage',
                current: Math.round(
                  diff.list.reduce(
                    (accumulator, { stats }) =>
                      accumulator + stats.all.damage_dealt,
                    0,
                  ) /
                    diff.list.reduce(
                      (accumulator, { stats }) =>
                        accumulator + stats.all.battles,
                      0,
                    ),
                ).toLocaleString(),
                career: Math.round(
                  tankStatsArray.reduce(
                    (accumulator, stats) =>
                      accumulator + stats.all.damage_dealt,
                    0,
                  ) /
                    tankStatsArray.reduce(
                      (accumulator, stats) => accumulator + stats.all.battles,
                      0,
                    ),
                ).toLocaleString(),
              },
            ]}
          />
        )}

        {diff?.list
          .sort((a, b) => b.stats.last_battle_time - a.stats.last_battle_time)
          .map(({ stats, tankopedia, career, careerWN8, currentWN8 }) => (
            <Breakdown.Row
              key={stats.tank_id}
              title={tankopedia?.name ?? `Unknown tank ${stats.tank_id}`}
              type="tank"
              tankType={tankopedia?.type}
              treeType={(() => {
                if (tankopedia?.is_collectible) return TreeTypeEnum.Collector;
                if (tankopedia?.is_premium) return TreeTypeEnum.Premium;
              })()}
              stats={[
                {
                  title: 'Battles',
                  current: stats.all.battles.toLocaleString(),
                  career: career.all.battles.toLocaleString(),
                },
                {
                  title: 'Winrate',
                  current: `${(
                    100 *
                    (stats.all.wins / stats.all.battles)
                  ).toFixed(2)}%`,
                  career: `${(
                    100 *
                    (career.all.wins / career.all.battles)
                  ).toFixed(2)}%`,
                  delta:
                    stats.all.wins / stats.all.battles -
                    career.all.wins / career.all.battles,
                },
                {
                  title: 'WN8',
                  current:
                    currentWN8 === undefined
                      ? undefined
                      : Math.round(currentWN8).toLocaleString(),
                  career:
                    careerWN8 === undefined
                      ? undefined
                      : Math.round(careerWN8).toLocaleString(),
                  percentile:
                    currentWN8 === undefined
                      ? undefined
                      : getWN8Percentile(currentWN8),
                },
                {
                  title: 'Damage',
                  current: Math.round(
                    stats.all.damage_dealt / stats.all.battles,
                  ).toLocaleString(),
                  career: Math.round(
                    career.all.damage_dealt / career.all.battles,
                  ).toLocaleString(),
                  delta:
                    stats.all.damage_dealt / stats.all.battles -
                    career.all.damage_dealt / career.all.battles,
                },
              ]}
            />
          ))}
      </Breakdown.Root>
    </PageWrapper>
  );
}

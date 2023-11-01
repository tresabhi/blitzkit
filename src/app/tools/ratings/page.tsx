'use client';

import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import {
  Button,
  Flex,
  Popover,
  Select,
  Text,
  TextField,
} from '@radix-ui/themes';
import { produce } from 'immer';
import { range } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import { create } from 'zustand';
import * as Leaderboard from '../../../components/Leaderboard';
import PageWrapper from '../../../components/PageWrapper';
import { FIRST_ARCHIVED_RATINGS_SEASON } from '../../../constants/ratings';
import { REGIONS, REGION_NAMES, Region } from '../../../constants/regions';
import { getAccountInfo } from '../../../core/blitz/getAccountInfo';
import { getClanAccountInfo } from '../../../core/blitz/getClanAccountInfo';
import getRatingsInfo from '../../../core/blitz/getRatingsInfo';
import getArchivedRatingsInfoAPI from '../../../core/blitzkrieg/getArchivedRatingsInfoAPI';
import { getArchivedRatingsLeaderboardAPI } from '../../../core/blitzkrieg/getArchivedRatingsLeaderboardAPI';
import { numberFetcher } from '../../../core/blitzkrieg/numberFetcher';
import { noArrows } from './page.css';

const ROWS_PER_PAGE = 64;

const useUsernameCache = create<Record<Region, Record<number, string>>>(() => ({
  asia: {},
  com: {},
  eu: {},
}));
const useClanCache = create<Record<Region, Record<number, string | undefined>>>(
  () => ({
    asia: {},
    com: {},
    eu: {},
  }),
);

export default function Page() {
  const usernameCache = useUsernameCache();
  const clanCache = useClanCache();
  const [region, setRegion] = useState<Region>('com');
  // null being the latest season
  const [season, setSeason] = useState<null | number>(null);
  const { data: ratingsInfo } = useSWR(
    `ratings-info-${region}-${season}`,
    () =>
      season === null
        ? getRatingsInfo(region)
        : getArchivedRatingsInfoAPI(region, season),
  );
  const [jumpToLeague, setJumpToLeague] = useState(0);
  const { data: latestArchivedSeasonNumber } = useSWR<number>(
    '/api/ratings/latest-archived-season-number',
    numberFetcher,
  );
  const players = useSWR(`ratings-players-${region}-${season}`, () => {
    if (season === null) {
      // i'll deal with this later
      return null;
    } else {
      return getArchivedRatingsLeaderboardAPI(region, season);
    }
  });
  const [page, setPage] = useState(0);
  const pageInput = useRef<HTMLInputElement>(null);
  const playerSlice = players.data?.slice(
    page * ROWS_PER_PAGE,
    page * ROWS_PER_PAGE + ROWS_PER_PAGE,
  );

  cachePage(page - 1);
  cachePage(page);
  cachePage(page + 1);

  function cachePage(page: number) {
    const ids = players.data
      ?.slice(page * ROWS_PER_PAGE, page * ROWS_PER_PAGE + ROWS_PER_PAGE)
      .map(({ id }) => id)
      .filter((id) => !(id in usernameCache[region]));

    if (ids && ids.length > 0) {
      getAccountInfo(region, ids).then((data) => {
        data.map((player) => {
          useUsernameCache.setState(
            produce((draft) => {
              draft[region][player.account_id] = player.nickname;
            }),
          );
        });
      });

      getClanAccountInfo(region, ids, ['clan']).then((data) => {
        data.map((player) => {
          useClanCache.setState(
            produce((draft) => {
              if (player) {
                draft[region][player.account_id] =
                  player.clan?.tag ?? undefined;
              }
            }),
          );
        });
      });
    }
  }

  useEffect(() => {
    if (pageInput.current) pageInput.current.value = `${page + 1}`;
  }, [page]);

  useEffect(() => {
    setPage(0);
  }, [season, region]);

  return (
    <PageWrapper>
      <Flex gap="2">
        <Select.Root
          defaultValue={region}
          onValueChange={(value) => setRegion(value as Region)}
        >
          <Select.Trigger style={{ flex: 1 }} />

          <Select.Content>
            {REGIONS.map((region) => (
              <Select.Item key={region} value={region}>
                {REGION_NAMES[region]}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>

        <Select.Root
          value={`${season}`}
          onValueChange={(value) =>
            setSeason(value === 'null' ? null : parseInt(value))
          }
        >
          <Select.Trigger style={{ flex: 1 }} />

          <Select.Content>
            {ratingsInfo?.detail === undefined && (
              <Select.Item value="null">Current season</Select.Item>
            )}

            <Select.Group>
              <Select.Label>Archives</Select.Label>

              {latestArchivedSeasonNumber &&
                range(
                  FIRST_ARCHIVED_RATINGS_SEASON,
                  latestArchivedSeasonNumber + 1,
                )
                  .map((season) => (
                    <Select.Item key={season} value={`${season}`}>
                      Season {season}
                    </Select.Item>
                  ))
                  .reverse()}
            </Select.Group>
          </Select.Content>
        </Select.Root>
      </Flex>

      <Flex justify="between" wrap="wrap" gap="2">
        <Flex gap="2">
          <Popover.Root>
            <Popover.Trigger>
              <Button variant="soft">Jump to league</Button>
            </Popover.Trigger>

            <Popover.Content>
              <Flex direction="column" gap="2">
                <Select.Root
                  value={`${jumpToLeague}`}
                  onValueChange={(value) => setJumpToLeague(parseInt(value))}
                >
                  <Select.Trigger />

                  <Select.Content>
                    {ratingsInfo?.detail === undefined &&
                      ratingsInfo?.leagues.map(({ index, title }) => (
                        <Select.Item key={index} value={`${index}`}>
                          {title}
                        </Select.Item>
                      ))}
                  </Select.Content>
                </Select.Root>

                <Flex gap="2">
                  <Popover.Close>
                    <Button color="red">Cancel</Button>
                  </Popover.Close>

                  <Popover.Close>
                    <Button>Jump</Button>
                  </Popover.Close>
                </Flex>
              </Flex>
            </Popover.Content>
          </Popover.Root>

          <Popover.Root>
            <Popover.Trigger>
              <Button variant="soft">Jump to player</Button>
            </Popover.Trigger>

            <Popover.Content>
              <Flex gap="2" direction="column">
                <TextField.Root>
                  <TextField.Slot>
                    <MagnifyingGlassIcon height="16" width="16" />
                  </TextField.Slot>

                  <TextField.Input placeholder="Search for player..." />
                </TextField.Root>

                <Flex gap="2">
                  <Popover.Close>
                    <Button color="red">Cancel</Button>
                  </Popover.Close>

                  <Popover.Close>
                    <Button>Jump</Button>
                  </Popover.Close>
                </Flex>
              </Flex>
            </Popover.Content>
          </Popover.Root>
        </Flex>
        <Flex gap="2" align="center">
          <Button
            variant="soft"
            onClick={() => setPage((page) => Math.max(page - 1, 0))}
          >
            {'<'}
          </Button>

          <TextField.Root className={noArrows}>
            <TextField.Slot>Page</TextField.Slot>
            <TextField.Input
              className={noArrows}
              type="number"
              ref={pageInput}
              style={{ width: 64, textAlign: 'center' }}
              onBlur={(event) => {
                setPage(
                  Math.max(
                    0,
                    Math.min(
                      Math.floor((players.data?.length ?? 0) / ROWS_PER_PAGE),
                      event.target.valueAsNumber - 1,
                    ),
                  ),
                );
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  (event.target as HTMLInputElement).blur();
                }
              }}
            />
            <TextField.Slot>
              out of {Math.ceil((players.data?.length ?? 0) / ROWS_PER_PAGE)}
            </TextField.Slot>
          </TextField.Root>

          <Button
            variant="soft"
            onClick={() =>
              setPage((page) =>
                Math.min(
                  page + 1,
                  Math.floor((players.data?.length ?? 0) / ROWS_PER_PAGE),
                ),
              )
            }
          >
            {'>'}
          </Button>
        </Flex>
      </Flex>

      <Leaderboard.Root>
        {playerSlice?.map((player, index) => (
          <Leaderboard.Item
            nickname={
              usernameCache[region][player.id] ?? `Unknown player ${player.id}`
            }
            position={page * ROWS_PER_PAGE + index + 1}
            score={player.score}
            clan={clanCache[region][player.id]}
            key={player.id}
          />
        ))}
      </Leaderboard.Root>

      {players.isLoading && <Text>Loading...</Text>}
    </PageWrapper>
  );
}

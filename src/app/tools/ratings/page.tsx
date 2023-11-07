'use client';

import {
  CaretLeftIcon,
  CaretRightIcon,
  MagnifyingGlassIcon,
} from '@radix-ui/react-icons';
import {
  Button,
  Dialog,
  Flex,
  Popover,
  Select,
  TextField,
} from '@radix-ui/themes';
import { produce } from 'immer';
import { debounce, range } from 'lodash';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import { create } from 'zustand';
import * as Leaderboard from '../../../components/Leaderboard';
import PageWrapper from '../../../components/PageWrapper';
import { FIRST_ARCHIVED_RATINGS_SEASON } from '../../../constants/ratings';
import { REGIONS, REGION_NAMES, Region } from '../../../constants/regions';
import { WARGAMING_APPLICATION_ID } from '../../../constants/wargamingApplicationID';
import fetchBlitz from '../../../core/blitz/fetchBlitz';
import { getAccountInfo } from '../../../core/blitz/getAccountInfo';
import { getClanAccountInfo } from '../../../core/blitz/getClanAccountInfo';
import getRatingsInfo from '../../../core/blitz/getRatingsInfo';
import { AccountList } from '../../../core/blitz/searchPlayersAcrossRegions';
import getArchivedRatingsInfoAPI from '../../../core/blitzkrieg/getArchivedRatingsInfoAPI';
import { getArchivedRatingsLeaderboardAPI } from '../../../core/blitzkrieg/getArchivedRatingsLeaderboardAPI';
import { numberFetcher } from '../../../core/blitzkrieg/numberFetcher';
import { noArrows } from './page.css';

const ROWS_OPTIONS = [5, 10, 25, 50, 100];

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
  const [rowsPerPage, setRowsPerPage] = useState(ROWS_OPTIONS[2]);
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
  const [highlightedPlayerId, setHighlightedPlayerId] = useState<number | null>(
    null,
  );
  const playerSlice = players.data?.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );
  const positionInput = useRef<HTMLInputElement>(null);
  const previousPage = () => setPage((page) => Math.max(page - 1, 0));
  const nextPage = () =>
    setPage((page) =>
      Math.min(page + 1, Math.floor((players.data?.length ?? 0) / rowsPerPage)),
    );
  const [searchResults, setSearchResults] = useState<AccountList | undefined>(
    undefined,
  );
  const handleSearchPlayerChange = debounce(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const trimmedSearch = event.target.value.trim();

      if (trimmedSearch) {
        const encodedSearch = encodeURIComponent(trimmedSearch);
        const accountList = await fetchBlitz<AccountList>(
          `https://api.wotblitz.com/wotb/account/list/?application_id=${WARGAMING_APPLICATION_ID}&search=${encodedSearch}&limit=100`,
        );

        setSearchResults(
          accountList.filter(
            (searchedPlayer) =>
              players.data?.some(
                (leaderboardPlayer) =>
                  leaderboardPlayer.id === searchedPlayer.account_id,
              ),
          ),
        );
      } else {
        setSearchResults(undefined);
      }
    },
    500,
  );

  cachePage(page - 1);
  cachePage(page);
  cachePage(page + 1);

  function cachePage(page: number) {
    const ids = players.data
      ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
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
  const handleJumpToPosition = () => {
    const rawPosition = positionInput.current!.valueAsNumber - 1;
    const position = Math.max(
      0,
      Math.min(rawPosition, (players.data?.length ?? 0) - 1),
    );
    setPage(Math.floor(position / rowsPerPage));

    if (players.data) {
      setHighlightedPlayerId(players.data[position].id);
    }
  };
  const [jumpToPositionOpen, setJumpToPositionOpen] = useState(false);

  useEffect(() => {
    setPage(0);
  }, [season, region]);

  function PageTurner() {
    const pageInput = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (pageInput.current) pageInput.current.value = `${page + 1}`;
    }, [page]);

    return (
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
                  Math.floor((players.data?.length ?? 0) / rowsPerPage),
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
          out of {Math.ceil((players.data?.length ?? 0) / rowsPerPage)}
        </TextField.Slot>
      </TextField.Root>
    );
  }

  return (
    <PageWrapper color="orange">
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

      <Flex justify="center" wrap="wrap" gap="2">
        <Button variant="soft" onClick={previousPage}>
          <CaretLeftIcon />
        </Button>
        <PageTurner />
        <Select.Root
          onValueChange={(value) => setRowsPerPage(parseInt(value))}
          defaultValue={`${rowsPerPage}`}
        >
          <Select.Trigger />

          <Select.Content>
            {ROWS_OPTIONS.map((size) => (
              <Select.Item value={`${size}`} key={size}>
                {size} per page
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
        <Button variant="soft" onClick={nextPage}>
          <CaretRightIcon />
        </Button>
      </Flex>

      <Flex gap="2" justify="center">
        <Dialog.Root
          open={jumpToPositionOpen}
          onOpenChange={setJumpToPositionOpen}
        >
          <Dialog.Trigger>
            <Button variant="soft">Jump to position...</Button>
          </Dialog.Trigger>

          <Dialog.Content>
            <Flex gap="4" justify="center">
              <TextField.Input
                ref={positionInput}
                onChange={handleSearchPlayerChange}
                type="number"
                placeholder="Type a position..."
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleJumpToPosition();
                    setJumpToPositionOpen(false);
                  }
                }}
              />

              <Flex gap="2">
                <Dialog.Close>
                  <Button color="red">Cancel</Button>
                </Dialog.Close>
                <Dialog.Close>
                  <Button onClick={handleJumpToPosition}>Jump</Button>
                </Dialog.Close>
              </Flex>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>

        <Popover.Root>
          <Popover.Trigger>
            <Button variant="soft">Jump to league...</Button>
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
              </Flex>
            </Flex>
          </Popover.Content>
        </Popover.Root>

        <Dialog.Root>
          <Dialog.Trigger>
            <Button variant="soft">Jump to player...</Button>
          </Dialog.Trigger>

          <Dialog.Content>
            <Flex gap="4" direction="column">
              <TextField.Root>
                <TextField.Slot>
                  <MagnifyingGlassIcon height="16" width="16" />
                </TextField.Slot>

                <TextField.Input
                  onChange={handleSearchPlayerChange}
                  placeholder="Search for player..."
                />
              </TextField.Root>

              <Flex direction="column" gap="2">
                {searchResults?.map((player) => (
                  <Dialog.Close>
                    <Button
                      key={player.account_id}
                      variant="ghost"
                      onClick={() => {
                        const playerIndex = players.data?.findIndex(
                          (playerData) => playerData.id === player.account_id,
                        );
                        const playerPage = Math.floor(
                          playerIndex! / rowsPerPage,
                        );

                        setPage(playerPage);
                        setHighlightedPlayerId(player.account_id);
                      }}
                    >
                      {player.nickname}
                    </Button>
                  </Dialog.Close>
                ))}

                {searchResults?.length === 0 && (
                  <Button disabled variant="ghost">
                    No players found in leaderboard
                  </Button>
                )}
              </Flex>

              <Flex gap="2">
                <Dialog.Close>
                  <Button color="red">Cancel</Button>
                </Dialog.Close>
              </Flex>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>
      </Flex>

      <Leaderboard.Root>
        {players.isLoading ? (
          <Leaderboard.Gap message="Loading players..." />
        ) : (
          playerSlice?.map((player, index) => (
            <Leaderboard.Item
              nickname={
                usernameCache[region][player.id] ??
                `Loading player ${player.id}...`
              }
              position={page * rowsPerPage + index + 1}
              score={player.score}
              clan={clanCache[region][player.id]}
              key={player.id}
              highlight={highlightedPlayerId === player.id}
            />
          ))
        )}
      </Leaderboard.Root>

      <Flex justify="center" gap="2">
        <Button variant="soft" onClick={previousPage}>
          <CaretLeftIcon />
        </Button>
        <PageTurner />
        <Button variant="soft" onClick={nextPage}>
          <CaretRightIcon />
        </Button>
      </Flex>
    </PageWrapper>
  );
}

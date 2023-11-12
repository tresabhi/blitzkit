'use client';

import { blackA, orangeDark } from '@radix-ui/colors';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import {
  Button,
  Dialog,
  Flex,
  Select,
  Text,
  TextField,
} from '@radix-ui/themes';
import { produce } from 'immer';
import { debounce, range } from 'lodash';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import { create } from 'zustand';
import { BlitzkriegRatingsLeaderboardEntry } from '../../../../scripts/buildRatingsLeaderboard';
import { RatingsPlayer } from '../../../commands/ratings';
import * as Leaderboard from '../../../components/Leaderboard';
import PageWrapper from '../../../components/PageWrapper';
import { LEAGUES } from '../../../constants/leagues';
import { FIRST_ARCHIVED_RATINGS_SEASON } from '../../../constants/ratings';
import { REGIONS, REGION_NAMES, Region } from '../../../constants/regions';
import { WARGAMING_APPLICATION_ID } from '../../../constants/wargamingApplicationID';
import fetchBlitz from '../../../core/blitz/fetchBlitz';
import { getClanAccountInfo } from '../../../core/blitz/getClanAccountInfo';
import getRatingsInfo from '../../../core/blitz/getRatingsInfo';
import { getRatingsLeague } from '../../../core/blitz/getRatingsLeague';
import { getRatingsNeighbors } from '../../../core/blitz/getRatingsNeighbors';
import regionToRegionSubdomain from '../../../core/blitz/regionToRegionSubdomain';
import {
  AccountList,
  AccountListItem,
} from '../../../core/blitz/searchPlayersAcrossRegions';
import { getArchivedLatestSeasonNumber } from '../../../core/blitzkrieg/getArchivedLatestSeasonNumber';
import getArchivedRatingsInfo from '../../../core/blitzkrieg/getArchivedRatingsInfo';
import { getArchivedRatingsLeaderboard } from '../../../core/blitzkrieg/getArchivedRatingsLeaderboard';
import { withCORSProxy } from '../../../core/blitzkrieg/withCORSProxy';
import { PageTurner } from './components/PageTurner';

const ROWS_OPTIONS = [5, 10, 15, 25, 30];
const SEEDING_SIZE = 2 ** 7;

interface NameCacheEntry {
  nickname: string;
  clan?: string;
}
type NameCache = Record<Region, Record<number, NameCacheEntry | null>>;
type PlayersCache = Record<
  Region,
  Record<number, Record<number, BlitzkriegRatingsLeaderboardEntry>>
>;

const useNameCache = create<NameCache>(() => ({
  asia: {},
  com: {},
  eu: {},
}));
const usePlayersCache = create<PlayersCache>(() => ({
  asia: {},
  com: {},
  eu: {},
}));

export default function Page() {
  const [region, setRegion] = useState<Region>('com');
  const [season, setSeason] = useState<number>(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [jumpToLeague, setJumpToLeague] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);
  const [jumpToScoreOpen, setJumpToScoreOpen] = useState(false);
  const [jumpToPositionOpen, setJumpToPositionOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<
    (AccountListItem & { number: number })[] | undefined
  >(undefined);
  const [loadingProgress, setLoadingProgress] = useState<
    [number, number] | null
  >(null);
  const [highlightedPlayerId, setHighlightedPlayerId] = useState<number | null>(
    null,
  );

  const { data: ratingsInfo } = useSWR(
    `ratings-info-${region}-${season}`,
    () =>
      season === 0
        ? getRatingsInfo(region)
        : getArchivedRatingsInfo(region, season),
  );
  const { data: latestArchivedSeasonNumber } = useSWR<number>(
    getArchivedLatestSeasonNumber.name,
    getArchivedLatestSeasonNumber,
  );

  const names = useNameCache();
  const players = usePlayersCache();

  const positionInput = useRef<HTMLInputElement>(null);
  const scoreInput = useRef<HTMLInputElement>(null);
  const leaguePositionCache = useRef<Record<number, number>>({});

  const pages = Math.ceil(
    (ratingsInfo && ratingsInfo.detail === undefined ? ratingsInfo?.count : 1) /
      rowsPerPage,
  );

  // page reset on season or region change
  useEffect(() => {
    setPage(0);
  }, [season, region]);
  // initial leagues caching for current season
  useEffect(() => {
    if (season in players[region]) return;

    if (season === 0) {
      (async () => {
        const newNameCache: Record<number, NameCacheEntry> = {};
        const results = await Promise.all(
          range(0, 5).map(async (league: number) => {
            const leaguePlayers = await getRatingsLeague(region, league);
            leaguePositionCache.current[league] =
              leaguePlayers.result[0].number - 1;
            leaguePlayers.result.forEach((player) => {
              newNameCache[player.spa_id] = {
                nickname: player.nickname,
                clan: player.clan_tag,
              };
            });

            return leaguePlayers.result.reduce<
              Record<number, BlitzkriegRatingsLeaderboardEntry>
            >(
              (accumulator, player) => ({
                ...accumulator,

                [player.number - 1]: {
                  id: player.spa_id,
                  score: player.score,
                } satisfies BlitzkriegRatingsLeaderboardEntry,
              }),
              {},
            );
          }),
        );
        const newPlayers = results.reduce<
          Record<number, BlitzkriegRatingsLeaderboardEntry>
        >(
          (accumulator, result) => ({
            ...accumulator,
            ...result,
          }),
          {},
        );

        usePlayersCache.setState(
          produce((draft: PlayersCache) => {
            draft[region][season] = {
              ...draft[region][season],
              ...newPlayers,
            };
          }),
        );
        useNameCache.setState(
          produce((draft: NameCache) => {
            draft[region] = { ...draft[region], ...newNameCache };
          }),
        );
      })();
    } else {
      getArchivedRatingsLeaderboard(region, season).then((result) => {
        usePlayersCache.setState(
          produce((draft: PlayersCache) => {
            draft[region][season] = {
              ...draft[region][season],
              ...result,
            };
          }),
        );
      });
    }
  }, [season in players[region]]);
  // 2nd page caching for current season
  useEffect(() => {
    if (
      season === 0 &&
      players !== null &&
      players[region][season] &&
      0 in players[region][season]
    ) {
      cacheNeighbors(players[region][season][0].id, rowsPerPage * 3);
    }
  }, [players[region]?.[season] && 0 in players[region][season]]);
  // neighboring page caching for all seasons
  useEffect(() => {
    if (!ratingsInfo || ratingsInfo?.detail) return;

    if (season === 0) {
      const middleIndex = Math.round(page * rowsPerPage + rowsPerPage / 2);
      if (!(middleIndex in players[region][season])) return;
      const middleId = players[region][season][middleIndex].id;
      cacheNeighbors(middleId, rowsPerPage * 3);
    } else {
      const ids = range(
        Math.max(0, (page - 1) * rowsPerPage),
        Math.min(ratingsInfo.count - 1, (page + 1) * rowsPerPage + rowsPerPage),
      )
        .map((index) => players[region][season][index].id)
        .filter(Boolean)
        .filter((id) => !(id in names[region]));

      if (ids && ids.length > 0) {
        getClanAccountInfo(region, ids, ['clan']).then((data) => {
          data.map((player, index) => {
            useNameCache.setState(
              produce((draft: NameCache) => {
                draft[region][ids[index]] = player
                  ? {
                      nickname: player.account_name,
                      clan: player.clan?.tag,
                    }
                  : null;
              }),
            );
          });
        });
      }
    }
  }, [page, region, season, ratingsInfo?.detail]);

  async function cacheNeighbors(
    id: number,
    size: number,
  ): Promise<RatingsPlayer[]> {
    const { neighbors } = await getRatingsNeighbors(region, id, size);
    const radius = Math.round(size / 2);

    const targetPosition = Object.entries(players[region][season]).find(
      ([, player]) => id === player.id,
    )?.[0];

    if (targetPosition !== undefined) {
      let isMissing = false;
      const targetPositionAsNumber = parseInt(targetPosition);

      for (
        let position = Math.max(0, targetPositionAsNumber - radius);
        position <= targetPositionAsNumber + radius;
        position++
      ) {
        isMissing = !(position in players[region][season]);
        if (isMissing) break;
      }

      if (!isMissing) return [];
    }

    usePlayersCache.setState(
      produce((draft: PlayersCache) => {
        neighbors.forEach((neighbor) => {
          draft[region][season][neighbor.number - 1] = {
            id: neighbor.spa_id,
            score: neighbor.score,
          } satisfies BlitzkriegRatingsLeaderboardEntry;
        });
      }),
    );

    useNameCache.setState(
      produce((draft: NameCache) => {
        neighbors.forEach((neighbor) => {
          if (neighbor.nickname) {
            draft[region][neighbor.spa_id] = {
              nickname: neighbor.nickname,
              clan: neighbor.clan_tag,
            };
          }
        });
      }),
    );

    return neighbors;
  }
  async function handleJumpToPosition() {
    if (!ratingsInfo || ratingsInfo?.detail) return;

    const rawPosition = positionInput.current!.valueAsNumber - 1;
    const targetPosition = Math.max(
      0,
      Math.min(rawPosition, ratingsInfo.count - 1),
    );

    if (season === 0) {
      const playerEntries = Object.entries(players[region][season]);
      let closest: BlitzkriegRatingsLeaderboardEntry | null = null;
      let closestPosition: number | null = null;
      let closestPositionDistance = Infinity;

      playerEntries.forEach(([positionAsString, player]) => {
        const position = parseInt(positionAsString);
        const distance = Math.abs(position - targetPosition);

        if (distance < closestPositionDistance) {
          closestPositionDistance = distance;
          closestPosition = position;
          closest = player;
        }
      });

      if (closest === null || closestPosition === null) return;

      if (closestPositionDistance === 0) {
        setHighlightedPlayerId(
          (closest as BlitzkriegRatingsLeaderboardEntry).id,
        );
        setPage(Math.floor(targetPosition / rowsPerPage));

        return;
      }

      // 1 going down and -1 going up
      const loadingDirection = Math.sign(targetPosition - closestPosition);
      let seedingPlayer = (closest as BlitzkriegRatingsLeaderboardEntry).id;
      let targetPositionAcquired = false;
      let neighbors: RatingsPlayer[];

      setLoadingProgress([0, closestPositionDistance]);

      while (!targetPositionAcquired) {
        neighbors = await cacheNeighbors(seedingPlayer, SEEDING_SIZE);
        seedingPlayer = neighbors.at(loadingDirection === -1 ? 0 : -1)!.spa_id;

        if (loadingDirection === 1) {
          targetPositionAcquired =
            targetPosition <= neighbors.at(-1)!.number - 1;
          setLoadingProgress([
            Math.abs(neighbors.at(-1)!.number - 1 - closestPosition),
            closestPositionDistance,
          ]);
        } else {
          targetPositionAcquired = targetPosition >= neighbors[0].number - 1;
          setLoadingProgress([
            Math.abs(neighbors[0].number - 1 - closestPosition),
            closestPositionDistance,
          ]);
        }
      }

      setLoadingProgress(null);
      setPage(Math.floor(targetPosition / rowsPerPage));
      setHighlightedPlayerId(
        neighbors!.find((neighbor) => neighbor.number - 1 === targetPosition)!
          .spa_id,
      );
    } else {
      setPage(Math.floor(targetPosition / rowsPerPage));

      if (players) {
        setHighlightedPlayerId(players[region][season][targetPosition].id);
      }
    }
  }
  function handleJumpToScore() {
    if (!ratingsInfo || ratingsInfo?.detail) return;

    let playerIndex = -1;

    for (let index = ratingsInfo.count - 1; index >= 0; index--) {
      if (
        players[region][season][index].score >=
        scoreInput.current!.valueAsNumber
      ) {
        playerIndex = index;
        break;
      }
    }

    if (playerIndex === -1) return;

    setPage(Math.floor(playerIndex / rowsPerPage));

    if (players) {
      setHighlightedPlayerId(players[region][season][playerIndex].id);
    }
  }

  return (
    <PageWrapper color="orange">
      <Flex gap="4" wrap="wrap" justify="center">
        <Flex gap="2" wrap="wrap" justify="center">
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
            onValueChange={(value) => setSeason(parseInt(value))}
          >
            <Select.Trigger style={{ flex: 1 }} />

            <Select.Content>
              {ratingsInfo?.detail === undefined && (
                <Select.Item value="0">Current season</Select.Item>
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

          <Select.Root
            onValueChange={(value) => setRowsPerPage(parseInt(value))}
            value={`${rowsPerPage}`}
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
        </Flex>

        <Flex gap="3" justify="center" wrap="wrap" align="center">
          <Text>Jump to:</Text>
          <Dialog.Root open={jumpToScoreOpen} onOpenChange={setJumpToScoreOpen}>
            <Dialog.Trigger>
              <Button variant="ghost">Score</Button>
            </Dialog.Trigger>

            <Dialog.Content>
              <Flex gap="4" justify="center">
                <TextField.Input
                  ref={scoreInput}
                  type="number"
                  placeholder="Type a score..."
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      handleJumpToScore();
                      setJumpToScoreOpen(false);
                    }
                  }}
                />

                <Flex gap="2">
                  <Dialog.Close>
                    <Button color="red">Cancel</Button>
                  </Dialog.Close>
                  <Dialog.Close>
                    <Button onClick={handleJumpToScore}>Jump</Button>
                  </Dialog.Close>
                </Flex>
              </Flex>
            </Dialog.Content>
          </Dialog.Root>
          <Dialog.Root
            open={jumpToPositionOpen}
            onOpenChange={setJumpToPositionOpen}
          >
            <Dialog.Trigger>
              <Button variant="ghost">Position</Button>
            </Dialog.Trigger>

            <Dialog.Content>
              <Flex gap="4" justify="center">
                <TextField.Input
                  ref={positionInput}
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
          <Dialog.Root>
            <Dialog.Trigger>
              <Button variant="ghost">League</Button>
            </Dialog.Trigger>

            <Dialog.Content>
              <Flex gap="2" justify="center">
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
                  <Dialog.Close>
                    <Button color="red">Cancel</Button>
                  </Dialog.Close>
                  <Dialog.Close>
                    <Button
                      onClick={async () => {
                        if (season === 0) {
                          const position =
                            leaguePositionCache.current[jumpToLeague];
                          const newPage = Math.floor(position / rowsPerPage);

                          setPage(newPage);
                          if (players) {
                            setHighlightedPlayerId(
                              players[region][season][position].id,
                            );
                            cacheNeighbors(
                              players[region][season][position].id,
                              rowsPerPage * 3,
                            );
                          }
                        } else {
                          if (!ratingsInfo || ratingsInfo.detail || !players)
                            return;

                          const minScore =
                            LEAGUES[jumpToLeague - 1]?.minScore ?? Infinity;
                          let firstPlayerIndex = -1;

                          for (
                            let index = 0;
                            index < ratingsInfo.count;
                            index++
                          ) {
                            if (
                              players[region][season][index].score < minScore
                            ) {
                              firstPlayerIndex = index;
                              break;
                            }
                          }

                          if (firstPlayerIndex === -1) return;

                          setPage(Math.floor(firstPlayerIndex / rowsPerPage));
                          setHighlightedPlayerId(
                            players[region][season][firstPlayerIndex].id,
                          );
                        }
                      }}
                    >
                      Jump
                    </Button>
                  </Dialog.Close>
                </Flex>
              </Flex>
            </Dialog.Content>
          </Dialog.Root>
          <Dialog.Root>
            <Dialog.Trigger>
              <Button variant="ghost">Player</Button>
            </Dialog.Trigger>

            <Dialog.Content>
              <Flex gap="4" direction="column">
                <TextField.Root>
                  <TextField.Slot>
                    <MagnifyingGlassIcon height="16" width="16" />
                  </TextField.Slot>

                  <TextField.Input
                    onChange={debounce(
                      async (event: ChangeEvent<HTMLInputElement>) => {
                        const trimmedSearch = event.target.value.trim();
                        const encodedSearch = encodeURIComponent(trimmedSearch);

                        if (trimmedSearch) {
                          if (season === 0) {
                            setSearchLoading(true);

                            const response = await fetch(
                              withCORSProxy(
                                `https://${regionToRegionSubdomain(
                                  region,
                                )}.wotblitz.com/en/api/rating-leaderboards/search/?prefix=${encodedSearch}`,
                              ),
                            );
                            const accountList =
                              (await response.json()) as Record<
                                number,
                                {
                                  spa_id: number;
                                  nickname: string;
                                  clan_tag: string;
                                } & (
                                  | {
                                      skip: true;
                                    }
                                  | {
                                      skip: false;
                                      mmr: number;
                                      season_number: number;
                                      calibrationBattlesLeft: number;
                                      number: number;
                                      updated_at: string;
                                      neighbors: [];
                                    }
                                )
                              >;
                            const values = Object.values(accountList).filter(
                              (searchedPlayer) => !searchedPlayer.skip,
                            );
                            const valuesWithTypes =
                              values as ((typeof values)[number] & {
                                skip: false;
                              })[];

                            usePlayersCache.setState(
                              produce((draft: PlayersCache) => {
                                if (draft) {
                                  values.map((player) => {
                                    const playerWithTypes =
                                      player as typeof player & { skip: false };
                                    draft[region][season][
                                      playerWithTypes.number - 1
                                    ] = {
                                      id: playerWithTypes.spa_id,
                                      score: 0,
                                    };
                                  });
                                }
                              }),
                            );
                            useNameCache.setState(
                              produce((draft: typeof names) => {
                                valuesWithTypes.forEach((searchedPlayer) => {
                                  if (searchedPlayer.nickname) {
                                    draft[region][searchedPlayer.spa_id] = {
                                      nickname: searchedPlayer.nickname,
                                      clan: searchedPlayer.clan_tag,
                                    };
                                  }
                                });
                              }),
                            );
                            setSearchResults(
                              valuesWithTypes.map((searchedPlayer) => ({
                                account_id: searchedPlayer.spa_id,
                                nickname: searchedPlayer.nickname,
                                number: searchedPlayer.number,
                              })),
                            );
                            setSearchLoading(false);
                          } else {
                            setSearchLoading(true);
                            const accountList = await fetchBlitz<AccountList>(
                              `https://api.wotblitz.${region}/wotb/account/list/?application_id=${WARGAMING_APPLICATION_ID}&search=${encodedSearch}&limit=100`,
                            );
                            const playerKeys = Object.keys(players!);

                            setSearchResults(
                              accountList
                                .filter(
                                  (searchedPlayer) =>
                                    players &&
                                    searchedPlayer.account_id in players,
                                )
                                .map((searchedPlayer) => ({
                                  ...searchedPlayer,
                                  number: parseInt(
                                    playerKeys.find(
                                      (index) =>
                                        players[region][season][parseInt(index)]
                                          .id === searchedPlayer.account_id,
                                    )!,
                                  ),
                                })),
                            );
                            setSearchLoading(false);
                          }
                        } else {
                          setSearchResults(undefined);
                        }
                      },
                      500,
                    )}
                    placeholder="Search for player..."
                  />
                </TextField.Root>

                <Flex direction="column" gap="2">
                  {!searchLoading &&
                    searchResults?.map((player) => (
                      <Dialog.Close key={player.account_id}>
                        <Button
                          key={player.account_id}
                          variant="ghost"
                          onClick={() => {
                            if (season === 0) {
                              setPage(
                                Math.floor((player.number - 1) / rowsPerPage),
                              );
                              cacheNeighbors(
                                player.account_id,
                                rowsPerPage * 3,
                              );
                              setHighlightedPlayerId(player.account_id);
                            } else {
                              if (!ratingsInfo || ratingsInfo.detail) return;
                              let playerIndex = -1;

                              for (
                                let index = 0;
                                index < ratingsInfo.count;
                                index++
                              ) {
                                if (
                                  players[region][season][index].id ===
                                  player.account_id
                                ) {
                                  playerIndex = index;
                                  break;
                                }
                              }

                              const playerPage = Math.floor(
                                playerIndex! / rowsPerPage,
                              );

                              setPage(playerPage);
                              setHighlightedPlayerId(player.account_id);
                            }
                          }}
                        >
                          {player.nickname}
                        </Button>
                      </Dialog.Close>
                    ))}

                  {!searchLoading && searchResults?.length === 0 && (
                    <Button disabled variant="ghost">
                      No players found in leaderboard (try typing in the whole
                      name because Wargaming's search engine is finicky)
                    </Button>
                  )}

                  {!searchLoading && searchResults === undefined && (
                    <Button disabled variant="ghost">
                      Type a username in the text field above
                    </Button>
                  )}

                  {searchLoading && (
                    <Button disabled variant="ghost">
                      Searching...
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
      </Flex>

      <PageTurner page={page} pages={pages} setPage={setPage} />

      <Leaderboard.Root>
        {players === null ? (
          <Leaderboard.Gap message="Loading players..." />
        ) : (
          range(
            page * rowsPerPage,
            Math.min(
              page * rowsPerPage + rowsPerPage,
              ratingsInfo?.detail ? 0 : (ratingsInfo?.count ?? 1) - 1,
            ),
          ).map((index) => {
            const id = players[region][season]?.[index]?.id;

            return (
              <Leaderboard.Item
                nickname={
                  names[region][id] === null
                    ? `Deleted player ${id}`
                    : names[region][id]?.nickname ?? `Loading player...`
                }
                position={index + 1}
                score={players[region][season]?.[index]?.score}
                clan={id ? names[region][id]?.clan : undefined}
                key={index}
                highlight={highlightedPlayerId === id}
              />
            );
          })
        )}
      </Leaderboard.Root>

      <PageTurner page={page} pages={pages} setPage={setPage} />

      {loadingProgress !== null && (
        <Flex
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: blackA.blackA10,
            zIndex: 2,
            boxSizing: 'border-box',
            padding: 32,
            textAlign: 'center',
          }}
          gap="4"
          justify="center"
          align="center"
          direction="column"
        >
          <Text>
            Loading {loadingProgress[0]} of {loadingProgress[1]} players...
          </Text>

          <div
            style={{
              height: 16,
              width: '100%',
              maxWidth: 256,
              borderRadius: 8,
              backgroundColor: orangeDark.orange2,
            }}
          >
            <div
              style={{
                height: '100%',
                transitionDuration: '200ms',
                width: `${Math.round(
                  (loadingProgress[0] / loadingProgress[1]) * 100,
                )}%`,
                backgroundColor: orangeDark.orange9,
                borderRadius: 8,
              }}
            />
          </div>

          <Flex direction="column">
            <Text color="gray">Please be patient. Wargaming is slow.</Text>
            <Text color="gray">
              Players are loaded in batches of {SEEDING_SIZE}.
            </Text>
          </Flex>
        </Flex>
      )}
    </PageWrapper>
  );
}

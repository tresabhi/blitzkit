'use client';

import { blackA, orangeDark } from '@radix-ui/colors';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import {
  Button,
  Dialog,
  Flex,
  Select,
  Table,
  Text,
  TextField,
} from '@radix-ui/themes';
import { produce } from 'immer';
import { debounce, range } from 'lodash';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { create } from 'zustand';
import { BlitzkriegRatingsLeaderboardEntry } from '../../../../scripts/buildRatingsLeaderboard';
import { RatingsInfo, RatingsPlayer } from '../../../commands/ratings';
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
import { searchCurrentRatingsPlayers } from '../../../core/blitz/searchCurrentRatingsPlayers';
import {
  AccountList,
  AccountListItem,
} from '../../../core/blitz/searchPlayersAcrossRegions';
import { getArchivedLatestSeasonNumber } from '../../../core/blitzkrieg/getArchivedLatestSeasonNumber';
import getArchivedRatingsInfo from '../../../core/blitzkrieg/getArchivedRatingsInfo';
import { getArchivedRatingsLeaderboard } from '../../../core/blitzkrieg/getArchivedRatingsLeaderboard';
import { theme } from '../../../stitches.config';
import { PageTurner } from './components/PageTurner';

const ROWS_PER_PAGE = Math.floor(100 / 3);
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
type InfoCache = Record<Region, Record<number, RatingsInfo | undefined>>;

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
const useInfoCache = create<InfoCache>(() => ({
  asia: {},
  com: {},
  eu: {},
}));

export default function Page() {
  const [region, setRegion] = useState<Region>('com');
  const [season, setSeason] = useState<number>(0);
  const [page, setPage] = useState(0);
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
  const [highlightedPlayer, setHighlightedPlayer] = useState<
    { type: 'id'; id: number } | { type: 'position'; position: number } | null
  >(null);

  const ratingsInfo = useInfoCache()[region][season];
  const [latestArchivedSeasonNumber, setLatestArchivedSeasonNumber] = useState<
    number | null
  >(null);

  const names = useNameCache();
  const players = usePlayersCache();

  const positionInput = useRef<HTMLInputElement>(null);
  const scoreInput = useRef<HTMLInputElement>(null);
  const leaguePositionCache = useRef<Record<number, number>>({});

  const pages = Math.ceil(
    (ratingsInfo && ratingsInfo.detail === undefined ? ratingsInfo?.count : 1) /
      ROWS_PER_PAGE,
  );

  // page reset on season or region change
  useEffect(() => {
    setPage(0);

    (async () => {
      const newInfo =
        season === 0
          ? await getRatingsInfo(region)
          : await getArchivedRatingsInfo(region, season);
      useInfoCache.setState(
        produce((draft: InfoCache) => {
          draft[region][season] = newInfo;
        }),
      );
    })();
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
      cacheNeighbors(players[region][season][0].id, ROWS_PER_PAGE * 3);
    }
  }, [players[region]?.[season] && 0 in players[region][season]]);
  // neighboring page caching for all seasons
  useEffect(() => {
    if (!ratingsInfo || ratingsInfo?.detail) return;

    if (season === 0) {
      const middleIndex = Math.round(page * ROWS_PER_PAGE + ROWS_PER_PAGE / 2);
      if (!(middleIndex in players[region][season])) return;
      const middleId = players[region][season][middleIndex].id;
      cacheNeighbors(middleId, ROWS_PER_PAGE * 3);
    } else {
      const ids = range(
        Math.max(0, (page - 1) * ROWS_PER_PAGE),
        Math.min(
          ratingsInfo.count - 1,
          (page + 1) * ROWS_PER_PAGE + ROWS_PER_PAGE,
        ),
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
  }, [
    page,
    region,
    season,
    ratingsInfo?.detail,
    players[region][season] !== undefined && 0 in players[region][season],
  ]);
  // latest archived season number caching
  useEffect(() => {}, [
    getArchivedLatestSeasonNumber().then((result) => {
      setLatestArchivedSeasonNumber(result);
    }),
  ]);

  async function cacheNeighbors(
    id: number,
    size: number,
  ): Promise<RatingsPlayer[]> {
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

    const seedingPlayerPosition = parseInt(
      Object.entries(players[region][season]).find(
        ([, player]) => id === player.id,
      )![0],
    );
    const { neighbors } = await getRatingsNeighbors(region, id, size, true);

    usePlayersCache.setState(
      produce((draft: PlayersCache) => {
        neighbors.forEach((neighbor, neighborIndex) => {
          // const position = neighbor.number - 1;
          const position = neighborIndex - radius + seedingPlayerPosition;

          if (!(position in draft[region][season])) {
            draft[region][season][position] = {
              id: neighbor.spa_id,
              score: neighbor.score,
            } satisfies BlitzkriegRatingsLeaderboardEntry;
          }
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
  async function jumpToPosition(position: number) {
    if (!ratingsInfo || ratingsInfo?.detail) return;

    const targetPosition = Math.max(
      0,
      Math.min(position, ratingsInfo.count - 1),
    );

    if (season === 0) {
      const playerEntries = Object.entries(players[region][season]);
      let closestPlayer: BlitzkriegRatingsLeaderboardEntry | null = null;
      let closestPosition: number | null = null;
      let closestPositionDistance = Infinity;

      playerEntries.forEach(([positionAsString, player]) => {
        const position = parseInt(positionAsString);
        const distance = Math.abs(position - targetPosition);

        if (distance < closestPositionDistance) {
          closestPositionDistance = distance;
          closestPosition = position;
          closestPlayer = player;
        }
      });

      if (closestPlayer === null || closestPosition === null) return;

      if (closestPositionDistance === 0) {
        setHighlightedPlayer({ type: 'position', position: targetPosition });
        setPage(Math.floor(targetPosition / ROWS_PER_PAGE));

        return;
      }

      // 1 going down and -1 going up
      const loadingDirection = Math.sign(targetPosition - closestPosition);
      let seedingPlayer = (closestPlayer as BlitzkriegRatingsLeaderboardEntry)
        .id;
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
      setPage(Math.floor(targetPosition / ROWS_PER_PAGE));
      setHighlightedPlayer({ type: 'position', position: targetPosition });
    } else {
      setPage(Math.floor(targetPosition / ROWS_PER_PAGE));

      if (players) {
        setHighlightedPlayer({
          type: 'position',
          position: targetPosition,
        });
      }
    }
  }
  async function jumpToScore() {
    if (!ratingsInfo || ratingsInfo?.detail) return;

    const targetScore = scoreInput.current!.valueAsNumber;

    if (season === 0) {
      const playerEntries = Object.entries(players[region][season]);
      let closestPlayer: BlitzkriegRatingsLeaderboardEntry | null = null;
      let closestScore: number | null = null;
      let closestScoreDistance = Infinity;
      let closesIndex = -1;

      playerEntries.forEach(([positionAsString, player], index) => {
        const position = parseInt(positionAsString);
        const distance = Math.abs(player.score - targetScore);

        if (distance < closestScoreDistance) {
          closestScoreDistance = distance;
          closestScore = player.score;
          closestPlayer = player;
          closesIndex = position;
        }
      });

      if (closestPlayer === null || closestScore === null) return;

      if (closestScoreDistance === 0) {
        setHighlightedPlayer({ type: 'id', id: closesIndex });
        setPage(Math.floor(closesIndex / ROWS_PER_PAGE));
      }

      const loadingDirection = Math.sign(closestScore - targetScore);
      let targetPlayer: RatingsPlayer;
      let scoreAcquired = false;
      let seedingPlayer = closestPlayer as BlitzkriegRatingsLeaderboardEntry;

      setLoadingProgress([0, closestScoreDistance]);
      while (!scoreAcquired) {
        const neighbors = await cacheNeighbors(seedingPlayer.id, SEEDING_SIZE);
        const seedingNeighbor = neighbors.at(loadingDirection === 1 ? -1 : 0)!;
        seedingPlayer = {
          id: seedingNeighbor.spa_id,
          score: seedingNeighbor.score,
        };

        setLoadingProgress([
          closestScoreDistance - Math.abs(seedingNeighbor.score - targetScore),
          closestScoreDistance,
        ]);

        if (loadingDirection === 1) {
          scoreAcquired = seedingPlayer.score <= targetScore;
        } else {
          scoreAcquired = seedingPlayer.score >= targetScore;
        }

        if (scoreAcquired) {
          if (loadingDirection === 1) {
            targetPlayer = neighbors.find(
              (player) => player.score <= targetScore,
            )!;
          } else {
            targetPlayer = neighbors.findLast(
              (player) => player.score >= targetScore,
            )!;
          }
        }
      }

      setPage(Math.floor(targetPlayer!.number / ROWS_PER_PAGE));
      setHighlightedPlayer({ type: 'id', id: targetPlayer!.spa_id });
      setLoadingProgress(null);
    } else {
      let playerIndex = -1;

      for (let index = ratingsInfo.count; index >= 0; index--) {
        if (!(index in players[region][season])) continue;

        if (players[region][season][index].score >= targetScore) {
          playerIndex = index;
          break;
        }
      }

      if (playerIndex === -1) return;

      setPage(Math.floor(playerIndex / ROWS_PER_PAGE));

      if (players) {
        setHighlightedPlayer({
          type: 'position',
          position: playerIndex,
        });
      }
    }
  }

  const totalPlayers =
    !ratingsInfo?.detail && ratingsInfo?.count ? ratingsInfo.count : undefined;

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
                      jumpToScore();
                      setJumpToScoreOpen(false);
                    }
                  }}
                />

                <Flex gap="2">
                  <Dialog.Close>
                    <Button color="red">Cancel</Button>
                  </Dialog.Close>
                  <Dialog.Close>
                    <Button onClick={jumpToScore}>Jump</Button>
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
                      jumpToPosition(positionInput.current!.valueAsNumber - 1);
                      setJumpToPositionOpen(false);
                    }
                  }}
                />

                <Flex gap="2">
                  <Dialog.Close>
                    <Button color="red">Cancel</Button>
                  </Dialog.Close>
                  <Dialog.Close>
                    <Button
                      onClick={() =>
                        jumpToPosition(positionInput.current!.valueAsNumber - 1)
                      }
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
                          const newPage = Math.floor(position / ROWS_PER_PAGE);

                          setPage(newPage);
                          if (players) {
                            setHighlightedPlayer({
                              type: 'id',
                              id: players[region][season][position].id,
                            });
                            cacheNeighbors(
                              players[region][season][position].id,
                              4 * ROWS_PER_PAGE - 2,
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

                          setPage(Math.floor(firstPlayerIndex / ROWS_PER_PAGE));
                          setHighlightedPlayer({
                            type: 'id',
                            id: players[region][season][firstPlayerIndex].id,
                          });
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

                            const accountList =
                              await searchCurrentRatingsPlayers(
                                region,
                                trimmedSearch,
                              );
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
                              `https://api.wotblitz.${region}/wotb/account/list/?application_id=${WARGAMING_APPLICATION_ID}&search=${encodedSearch}`,
                            );
                            const playerKeys = Object.keys(
                              players[region][season],
                            );

                            setSearchResults(
                              accountList
                                .map((searchedPlayer) => ({
                                  ...searchedPlayer,
                                  number: parseInt(
                                    playerKeys.find(
                                      (indexAsString) =>
                                        players[region][season][
                                          parseInt(indexAsString)
                                        ].id === searchedPlayer.account_id,
                                    )!,
                                  ),
                                }))
                                .filter(
                                  (player) => !Number.isNaN(player.number),
                                ),
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
                                Math.floor((player.number - 1) / ROWS_PER_PAGE),
                              );
                              cacheNeighbors(
                                player.account_id,
                                ROWS_PER_PAGE * 3,
                              );
                              setHighlightedPlayer({
                                type: 'id',
                                id: player.account_id,
                              });
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
                                playerIndex! / ROWS_PER_PAGE,
                              );

                              setPage(playerPage);
                              setHighlightedPlayer({
                                type: 'id',
                                id: player.account_id,
                              });
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

      <PageTurner
        page={page}
        pages={pages}
        onPageChange={(page, isButtonClick) =>
          isButtonClick ? setPage(page) : jumpToPosition(page * ROWS_PER_PAGE)
        }
      />

      <Table.Root variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell width="0">Position</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Player</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell width="0">Reward</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell width="0">
              Percentile
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell width="0">Score</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        {range(
          page * ROWS_PER_PAGE,
          Math.min(
            page * ROWS_PER_PAGE + ROWS_PER_PAGE,
            ratingsInfo?.detail ? 0 : (ratingsInfo?.count ?? 1) - 1,
          ),
        ).map((index) => {
          const id = players[region][season]?.[index]?.id;
          const clan = id ? names[region][id]?.clan : undefined;
          const position = index + 1;
          const highlight = highlightedPlayer
            ? highlightedPlayer.type === 'id'
              ? highlightedPlayer.id === id
              : highlightedPlayer.position === index
            : false;
          const reward =
            !ratingsInfo?.detail && ratingsInfo?.rewards
              ? ratingsInfo.rewards.find(
                  (reward) =>
                    reward.from_position <= position &&
                    reward.to_position >= position,
                )
              : undefined;

          return (
            <Table.Row
              style={{
                backgroundColor: highlight
                  ? theme.colors.componentInteractiveActive_orange
                  : 'unset',
                cursor: 'pointer',
              }}
              key={index}
              onClick={() => {
                setHighlightedPlayer({ type: 'position', position: index });
              }}
            >
              <Table.Cell key={index}>{position.toLocaleString()}.</Table.Cell>
              <Table.Cell key={index}>
                {names[region][id] === null
                  ? `Deleted player ${id}`
                  : names[region][id]?.nickname ?? `Loading player...`}
                <Text color="gray">{clan ? ` [${clan}]` : ''}</Text>
              </Table.Cell>
              <Table.Cell key={index} align="center" justify="center">
                {reward ? (
                  <Flex align="center" justify="center" gap="1">
                    <img
                      style={{
                        objectFit: 'contain',
                      }}
                      width={32}
                      height={32}
                      src={
                        reward.type === 'stuff'
                          ? reward.stuff.image_url
                          : reward.vehicle.image_url
                      }
                    />
                    {reward.count === 1 ? '' : `x${reward.count}`}
                  </Flex>
                ) : (
                  '--'
                )}
              </Table.Cell>
              <Table.Cell key={index} align="right" justify="center">
                {totalPlayers
                  ? Math.ceil(((index + 1) / totalPlayers) * 100)
                  : '--'}
                %
              </Table.Cell>
              <Table.Cell key={index} align="right">
                {players[region][season]?.[index]?.score.toLocaleString()}
              </Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Root>

      <PageTurner
        page={page}
        pages={pages}
        onPageChange={(page, isButtonClick) =>
          isButtonClick ? setPage(page) : jumpToPosition(page * ROWS_PER_PAGE)
        }
      />

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
            Loading {loadingProgress[0]} of {loadingProgress[1]} assets...
          </Text>

          <div
            style={{
              height: 16,
              width: '100%',
              maxWidth: 256,
              borderRadius: 8,
              backgroundColor: orangeDark.orange2,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                transitionDuration: '10s',
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
            {loadingProgress[0] === 0 && (
              <Text color="gray">First assets will be fetched shortly.</Text>
            )}
          </Flex>
        </Flex>
      )}
    </PageWrapper>
  );
}

'use client';

import {
  ArrowDownIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@radix-ui/react-icons';
import {
  AlertDialog,
  Button,
  Card,
  DropdownMenu,
  Flex,
  Heading,
  IconButton,
  Select,
  Spinner,
  Table,
  Text,
  TextField,
} from '@radix-ui/themes';
import { debounce } from 'lodash';
import { use, useEffect, useMemo, useRef, useState } from 'react';
import PageWrapper from '../../../components/PageWrapper';
import { TankRowHeaderCell } from '../../../components/TankRowHeaderCell';
import { UNLOCALIZED_REGION_NAMES_SHORT } from '../../../constants/regions';
import {
  STAT_KEYS,
  STAT_NAMES,
  Stat,
  generateStats,
  prettifyStats,
  sumStats,
} from '../../../core/blitz/generateStats';
import {
  IndividualAccountInfo,
  getAccountInfo,
} from '../../../core/blitz/getAccountInfo';
import getTankStats from '../../../core/blitz/getTankStats';
import { idToRegion } from '../../../core/blitz/idToRegion';
import searchPlayersAcrossRegions, {
  AccountListWithServer,
} from '../../../core/blitz/searchPlayersAcrossRegions';
import { tankDefinitions } from '../../../core/blitzkit/tankDefinitions';
import { tankAverages } from '../../../core/blitzstars/tankAverages';
import { deltaTankStats } from '../../../core/statistics/deltaTankStats';
import { useWideFormat } from '../../../hooks/useWideFormat';
import * as Session from '../../../stores/session';
import { IndividualTankStats } from '../../../types/tanksStats';

export default function Page({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  const [loaded, setLoaded] = useState(false);
  const wideFormat = useWideFormat(640);
  const awaitedTankDefinitions = use(tankDefinitions);
  const awaitedTankAvearges = use(tankAverages);
  const [showSearch, setShowSearch] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<AccountListWithServer>([]);
  const [showCCInaccessibilityPrompt, setShowCCInaccessibilityPrompt] =
    useState(false);
  const input = useRef<HTMLInputElement>(null);
  const session = Session.use();
  const mutateSession = Session.useMutation();
  const [tankStatsB, setTankStatsB] = useState<IndividualTankStats[] | null>(
    null,
  );
  const accountInfoPromise = useMemo(
    () =>
      new Promise<IndividualAccountInfo | null>(async (resolve) => {
        resolve(
          session.tracking
            ? await getAccountInfo(session.player.region, session.player.id)
            : null,
        );
      }),
    [session.tracking && session.player.id],
  );
  const accountInfo = use(accountInfoPromise);
  const delta = useMemo(
    () =>
      session.tracking && tankStatsB
        ? deltaTankStats(session.player.stats, tankStatsB)
            .sort((a, b) => b.last_battle_time - a.last_battle_time)
            .map((entry) => {
              const tank = awaitedTankDefinitions[entry.tank_id];
              const average = awaitedTankAvearges[tank.id];
              const stats = generateStats(entry.all, average?.all);
              const statsPretty = prettifyStats(stats);

              return {
                tank,
                stats,
                statsPretty,
              };
            })
        : undefined,
    [session.tracking && session.player, tankStatsB],
  );
  const total = useMemo(
    () =>
      delta
        ? prettifyStats(sumStats(delta.map(({ stats }) => stats)))
        : undefined,
    [delta],
  );
  const [showLinkOverridePrompt, setShowLinkOverridePrompt] = useState(true);

  const search = debounce(async () => {
    if (!input.current) return;

    setSearchResults(await searchPlayersAcrossRegions(input.current.value, 9));
    setSearching(false);
  }, 500);

  async function track(id: number) {
    const region = idToRegion(id);
    const player = await getAccountInfo(region, id);
    const stats = await getTankStats(region, id);

    if (stats === null) {
      setShowCCInaccessibilityPrompt(true);
      return;
    }

    setShowSearch(false);
    mutateSession((draft) => {
      if (!input.current) return;

      draft.tracking = true;
      (draft as Session.SessionTracking).player = {
        id,
        region,
        since: Date.now(),
        stats,
      };

      input.current.value = player.nickname;
    });
  }

  useEffect(() => {
    async function update() {
      if (!session.tracking) return;

      const tankStats = await getTankStats(
        idToRegion(session.player.id),
        session.player.id,
      );
      setTankStatsB(tankStats);
    }

    update();
    const interval = setInterval(update, 5 * 1000);

    return () => clearInterval(interval);
  }, [session.tracking && session.player.id]);

  useEffect(() => {
    setLoaded(true);

    if (searchParams.id && !session.tracking) {
      track(Number(searchParams.id));
    }
  }, []);

  if (!loaded) {
    return (
      <PageWrapper align="center" justify="center">
        <Spinner />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper color="blue">
      <AlertDialog.Root
        open={showCCInaccessibilityPrompt}
        onOpenChange={setShowCCInaccessibilityPrompt}
      >
        <AlertDialog.Content>
          <AlertDialog.Title>
            You're attempting to track a CC account
          </AlertDialog.Title>
          <AlertDialog.Description>
            CC (community contributor) accounts do not have public tank
            statistics. We are in the process of adding embeds for CC accounts,
            stay tuned.
          </AlertDialog.Description>

          <Flex mt="4" justify="end">
            <AlertDialog.Action>
              <Button variant="solid">Alright</Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>

      {searchParams.id &&
        session.tracking &&
        Number(searchParams.id) !== session.player.id && (
          <AlertDialog.Root
            open={showLinkOverridePrompt}
            onOpenChange={setShowLinkOverridePrompt}
          >
            <AlertDialog.Content>
              <AlertDialog.Title>
                You are currently tracking {accountInfo?.nickname}
              </AlertDialog.Title>
              <AlertDialog.Description>
                Would you like to stop tracking {accountInfo?.nickname} and
                start tracking a new player?
              </AlertDialog.Description>

              <Flex mt="4" justify="end">
                <AlertDialog.Action>
                  <Button
                    variant="solid"
                    onClick={() => {
                      setShowLinkOverridePrompt(false);
                      track(Number(searchParams.id));
                    }}
                  >
                    Proceed
                  </Button>
                </AlertDialog.Action>
              </Flex>
            </AlertDialog.Content>
          </AlertDialog.Root>
        )}

      {!session.tracking && (
        <Flex
          style={{ flex: 1 }}
          align="center"
          justify="center"
          direction="column"
          gap="3"
        >
          <Flex gap="2" align="center">
            <Text color="gray">Look up a player to get started</Text>
            <ArrowDownIcon />
          </Flex>

          <TextField.Root
            size="3"
            style={{
              position: 'relative',
              width: '75vw',
              maxWidth: 480,
            }}
            ref={input}
            placeholder="Search players..."
            onChange={() => {
              if (!input.current) return;

              const sanitized = input.current.value.trim();

              if (sanitized.length > 0) {
                setShowSearch(true);
                setSearching(true);
                search();
              } else {
                setShowSearch(false);
              }
            }}
          >
            <TextField.Slot>
              <MagnifyingGlassIcon />
            </TextField.Slot>

            {showSearch && (
              <Card
                mt="2"
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  width: '100%',
                }}
              >
                {searching && (
                  <Flex justify="center">
                    <Text color="gray">Searching...</Text>
                  </Flex>
                )}

                {!searching && searchResults.length === 0 && (
                  <Flex justify="center">
                    <Text color="gray">No players found</Text>
                  </Flex>
                )}

                {!searching && searchResults.length > 0 && (
                  <Flex direction="column" gap="2">
                    {searchResults.map((player) => (
                      <Button
                        key={player.account_id}
                        variant="ghost"
                        onClick={() => track(player.account_id)}
                      >
                        {player.nickname} (
                        {UNLOCALIZED_REGION_NAMES_SHORT[player.region]})
                      </Button>
                    ))}
                  </Flex>
                )}
              </Card>
            )}
          </TextField.Root>
        </Flex>
      )}

      {session.tracking && (
        <Flex
          mt="2"
          mb="2"
          direction={wideFormat ? 'row' : 'column'}
          align="center"
          justify="between"
          gap="2"
        >
          <Flex mt="2" mb="2" direction="column" gap="2">
            <Heading size="5">Tracking {accountInfo?.nickname}</Heading>
            <Text color="gray">
              Since {new Date(session.player.since).toLocaleString()}
            </Text>
          </Flex>

          <Flex gap="2" align="center" justify="center">
            <Button
              color="red"
              onClick={async () => {
                const stats = await getTankStats(
                  session.player.region,
                  session.player.id,
                );

                if (stats === null) {
                  setShowCCInaccessibilityPrompt(true);
                  return;
                }

                mutateSession((draft) => {
                  (draft as Session.SessionTracking).player.stats = stats;
                });
              }}
            >
              Reset
            </Button>
            <Button
              onClick={() => {
                mutateSession((draft) => {
                  draft.tracking = false;
                });
              }}
            >
              Change
            </Button>
          </Flex>
        </Flex>
      )}

      {session.tracking && delta && delta.length > 0 && (
        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Tank</Table.ColumnHeaderCell>
              {session.columns.map((column, index) => (
                <Table.ColumnHeaderCell
                  width="0"
                  key={column}
                  style={{
                    position: 'relative',
                  }}
                >
                  {index === 0 && session.columns.length < 4 && (
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger>
                        <IconButton
                          size="1"
                          variant="surface"
                          style={{
                            position: 'absolute',
                            left: 0,
                            top: '50%',
                            transform: 'translate(-100%, -50%)',
                            zIndex: 1,
                          }}
                        >
                          <PlusIcon />
                        </IconButton>
                      </DropdownMenu.Trigger>

                      <DropdownMenu.Content>
                        {STAT_KEYS.filter(
                          (item) => !session.columns.includes(item),
                        ).map((key) => (
                          <DropdownMenu.Item
                            key={key}
                            onClick={() => {
                              mutateSession((draft) => {
                                (
                                  draft as Session.SessionTracking
                                ).columns.unshift(key as Stat);
                              });
                            }}
                          >
                            {STAT_NAMES[key]}
                          </DropdownMenu.Item>
                        ))}
                      </DropdownMenu.Content>
                    </DropdownMenu.Root>
                  )}

                  <Select.Root
                    value={column}
                    onValueChange={(value) => {
                      mutateSession((draft) => {
                        if (value === 'remove') {
                          (draft as Session.SessionTracking).columns.splice(
                            index,
                            1,
                          );
                        } else {
                          (draft as Session.SessionTracking).columns[index] =
                            value as Stat;
                        }
                      });
                    }}
                  >
                    <Select.Trigger variant="ghost" />

                    <Select.Content>
                      {STAT_KEYS.filter(
                        (item) =>
                          !session.columns.includes(item) || item === column,
                      ).map((key) => (
                        <Select.Item key={key} value={key}>
                          {STAT_NAMES[key]}
                        </Select.Item>
                      ))}

                      <Select.Separator />

                      <Select.Item value="remove">Remove</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </Table.ColumnHeaderCell>
              ))}
            </Table.Row>
          </Table.Header>

          <Table.Body>
            <Table.Row
              style={{
                overflow: 'hidden',
              }}
            >
              <Table.RowHeaderCell
                style={{
                  paddingLeft: 32,
                  position: 'relative',
                  overflowY: 'hidden',
                }}
              >
                Total
              </Table.RowHeaderCell>
              {session.columns.map((column) => (
                <Table.Cell key={column}>{total![column]}</Table.Cell>
              ))}
            </Table.Row>

            {delta.map(({ statsPretty, tank }) => {
              return (
                <Table.Row
                  key={tank.id}
                  style={{
                    overflow: 'hidden',
                  }}
                >
                  <TankRowHeaderCell tank={tank} />
                  {session.columns.map((column) => (
                    <Table.Cell key={column}>{statsPretty[column]}</Table.Cell>
                  ))}
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table.Root>
      )}

      {session.tracking && delta && delta.length === 0 && (
        <Flex
          align="center"
          justify="center"
          direction="column"
          style={{
            flex: 1,
          }}
        >
          <Heading color="gray">No battles</Heading>
          <Text color="gray">Go ahead and play a game</Text>
        </Flex>
      )}
    </PageWrapper>
  );
}

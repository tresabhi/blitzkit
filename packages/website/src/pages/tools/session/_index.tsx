import {
  STAT_KEYS,
  STAT_NAMES,
  deltaTankStats,
  fetchAverageDefinitions,
  fetchTankDefinitions,
  generateStats,
  getAccountInfo,
  getTankStats,
  idToRegion,
  prettifyStats,
  searchPlayersAcrossRegions,
  sumBlitzStarsStats,
  type AccountListWithServer,
  type IndividualAccountInfo,
  type IndividualTankStats,
  type Stat,
} from '@blitzkit/core';
import strings from '@blitzkit/core/lang/en-US.json';
import {
  ArrowDownIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@radix-ui/react-icons';
import {
  AlertDialog,
  Button,
  DropdownMenu,
  Flex,
  Heading,
  IconButton,
  Select,
  Table,
  Text,
  TextField,
} from '@radix-ui/themes';
import { debounce } from 'lodash-es';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PageWrapper } from '../../../components/PageWrapper';
import { TankRowHeaderCell } from '../../../components/TankRowHeaderCell';
import { Session, type SessionTracking } from '../../../stores/session';

const tankDefinitions = await fetchTankDefinitions();
const tankAverages = await fetchAverageDefinitions();

export function Page() {
  return (
    <Session.Provider>
      <Content />
    </Session.Provider>
  );
}

function Content() {
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
  const [accountInfo, setAccountInfo] = useState<
    IndividualAccountInfo | null | undefined
  >(undefined);

  useEffect(() => {
    (async () => {
      const id = session.tracking ? session.player.id : undefined;
      if (!id) return setAccountInfo(null);

      setAccountInfo(
        session.tracking ? await getAccountInfo(idToRegion(id), id) : null,
      );
    })();
  }, [session.tracking && session.player.id]);
  const delta = useMemo(
    () =>
      session.tracking && tankStatsB
        ? deltaTankStats(session.player.stats, tankStatsB)
            .sort((a, b) => b.last_battle_time - a.last_battle_time)
            .map((entry) => {
              const tank = tankDefinitions.tanks[entry.tank_id];
              const average = tankAverages.averages[tank.id];
              const stats = generateStats(entry.all, average?.mu);
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
        ? prettifyStats(sumBlitzStarsStats(delta.map(({ stats }) => stats)))
        : undefined,
    [delta],
  );
  const search = debounce(async () => {
    if (!input.current) return;

    setSearchResults(await searchPlayersAcrossRegions(input.current.value, 15));
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
      (draft as SessionTracking).player = {
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
          </TextField.Root>

          {showSearch && (
            <Flex mt="2">
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
                      {strings.common.regions.short[player.region]})
                    </Button>
                  ))}
                </Flex>
              )}
            </Flex>
          )}
        </Flex>
      )}

      {session.tracking && (
        <Flex
          mt="2"
          mb="2"
          direction={{ initial: 'column', sm: 'row' }}
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
                  (draft as SessionTracking).player.stats = stats;
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
                                (draft as SessionTracking).columns.unshift(
                                  key as Stat,
                                );
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
                          (draft as SessionTracking).columns.splice(index, 1);
                        } else {
                          (draft as SessionTracking).columns[index] =
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

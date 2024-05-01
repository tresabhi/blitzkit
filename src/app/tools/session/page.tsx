'use client';

import {
  ArrowDownIcon,
  InfoCircledIcon,
  MagnifyingGlassIcon,
} from '@radix-ui/react-icons';
import {
  AlertDialog,
  Button,
  Card,
  Flex,
  Heading,
  Link,
  Table,
  Text,
  TextField,
} from '@radix-ui/themes';
import { debounce } from 'lodash';
import { use, useEffect, useMemo, useRef, useState } from 'react';
import PageWrapper from '../../../components/PageWrapper';
import { UNLOCALIZED_REGION_NAMES_SHORT } from '../../../constants/regions';
import { authURL } from '../../../core/blitz/authURL';
import {
  getAccountInfo,
  IndividualAccountInfo,
} from '../../../core/blitz/getAccountInfo';
import getTankStats from '../../../core/blitz/getTankStats';
import { idToRegion } from '../../../core/blitz/idToRegion';
import searchPlayersAcrossRegions, {
  AccountListWithServer,
} from '../../../core/blitz/searchPlayersAcrossRegions';
import { tankDefinitions } from '../../../core/blitzkit/tankDefinitions';
import { tankIcon } from '../../../core/blitzkit/tankIcon';
import { useApp } from '../../../stores/app';
import mutateSession, {
  SessionTracking,
  useSession,
} from '../../../stores/session';
import { IndividualTankStats } from '../../../types/tanksStats';

export default function Page() {
  const awaitedTankDefinitions = use(tankDefinitions);
  const [showSearch, setShowSearch] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<AccountListWithServer>([]);
  const [showFurtherVerification, setShowFurtherVerification] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const session = useSession();
  const login = useApp((state) => state.login);
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

  const search = debounce(async () => {
    if (!input.current) return;

    setSearchResults(await searchPlayersAcrossRegions(input.current.value, 9));
    setSearching(false);
  }, 500);

  useEffect(() => {
    (async () => {
      if (!session.tracking || !input.current) return;

      let accountInfo = await getAccountInfo(
        session.player.region,
        session.player.id,
      );
      let tankStats = await getTankStats(
        session.player.region,
        session.player.id,
      );

      if (accountInfo === null) {
        if (login?.id === session.player.id) {
          accountInfo = await getAccountInfo(
            idToRegion(session.player.id),
            session.player.id,
            [],
            { access_token: login.token },
          );
          tankStats = await getTankStats(
            idToRegion(session.player.id),
            session.player.id,
            { access_token: login.token },
          );

          console.log(accountInfo, tankStats);

          input.current.value = accountInfo.nickname;
        } else {
          setShowFurtherVerification(true);
        }
      }
    })();

    if (session.tracking) {
      const interval = setInterval(async () => {
        const tankStats = await getTankStats(
          idToRegion(session.player.id),
          session.player.id,
        );
        setTankStatsB(tankStats);

        // TODO: make refresh rate configurable
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [session.tracking && session.player.id]);

  return (
    <PageWrapper>
      {/* omit totally to avoid accessing undefined player */}
      {showFurtherVerification && (
        <AlertDialog.Root open>
          <AlertDialog.Content>
            <AlertDialog.Title>We need further verification</AlertDialog.Title>
            <AlertDialog.Description>
              You're trying to track a CC account which have private statistics.
              Please sign in to verify the ownership of this account. Individual
              tank statistics won't be available.
            </AlertDialog.Description>

            {login && (
              <AlertDialog.Description mt="2" color="red">
                <InfoCircledIcon /> You are currently signed with a different
                account.
              </AlertDialog.Description>
            )}

            <Flex gap="3" mt="4" justify="end">
              <AlertDialog.Cancel>
                <Button
                  variant="soft"
                  color="gray"
                  onClick={() => {
                    mutateSession((draft) => {
                      draft.tracking = false;
                    });
                    setShowFurtherVerification(false);
                  }}
                >
                  Cancel
                </Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action>
                <Link
                  href={authURL(
                    (session as SessionTracking).player.region,
                    location.href,
                  )}
                >
                  <Button variant="solid">Sign in</Button>
                </Link>
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
                        onClick={() => {
                          setShowSearch(false);
                          mutateSession((draft) => {
                            if (!input.current) return;

                            draft.tracking = true;
                            (draft as SessionTracking).player = {
                              id: player.account_id,
                              region: player.region,
                            };

                            input.current.value = player.nickname;
                          });
                        }}
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
        <Flex gap="4" align="center" justify="center" mt="2">
          <Heading size="5">Tracking {accountInfo?.nickname}</Heading>
          <Button
            color="red"
            variant="ghost"
            onClick={() => {
              mutateSession((draft) => {
                draft.tracking = false;
              });
            }}
          >
            Stop
          </Button>
        </Flex>
      )}

      {session.tracking && tankStatsB && tankStatsB.length > 0 && (
        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Tank</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width="0">Battles</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width="0">Winrate</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {tankStatsB
              .filter((stat) => stat.all.battles > 0)
              .sort((a, b) => b.last_battle_time - a.last_battle_time)
              .map((stat) => {
                const tank = awaitedTankDefinitions[stat.tank_id];

                return (
                  <Table.Row
                    key={tank.id}
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
                      <img
                        draggable={false}
                        src={tankIcon(tank.id)}
                        style={{
                          position: 'absolute',
                          width: 128 + 32,
                          height: '200%',
                          top: '-50%',
                          left: 0,
                          objectFit: 'contain',
                          objectPosition: '50% 50%',
                          overflow: 'hidden',
                        }}
                      />

                      <div
                        style={{
                          backgroundColor: 'red',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          height: '100%',
                          width: 128,
                          background:
                            'linear-gradient(90deg, #00000080, #00000000)',
                        }}
                      />

                      <Text
                        style={{
                          position: 'relative',
                          textWrap: 'nowrap',
                          textShadow: 'black 0 0 4px',
                        }}
                      >
                        {tank.name}
                      </Text>
                    </Table.RowHeaderCell>
                    <Table.Cell align="right">{stat.all.battles}</Table.Cell>
                    <Table.Cell align="right">
                      {((100 * stat.all.wins) / stat.all.battles).toFixed(0)}%
                    </Table.Cell>
                  </Table.Row>
                );
              })}
          </Table.Body>
        </Table.Root>
      )}

      {session.tracking && tankStatsB && tankStatsB.length === 0 && (
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

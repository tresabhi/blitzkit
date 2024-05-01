'use client';

import { InfoCircledIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import {
  AlertDialog,
  Button,
  Card,
  Flex,
  Link,
  Text,
  TextField,
} from '@radix-ui/themes';
import { debounce } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import PageWrapper from '../../../components/PageWrapper';
import { UNLOCALIZED_REGION_NAMES_SHORT } from '../../../constants/regions';
import { authURL } from '../../../core/blitz/authURL';
import { getAccountInfo } from '../../../core/blitz/getAccountInfo';
import getTankStats from '../../../core/blitz/getTankStats';
import { idToRegion } from '../../../core/blitz/idToRegion';
import searchPlayersAcrossRegions, {
  AccountListWithServer,
} from '../../../core/blitz/searchPlayersAcrossRegions';
import { useApp } from '../../../stores/app';
import mutateSession, {
  SessionTracking,
  useSession,
} from '../../../stores/session';

export default function Page() {
  const [showSearch, setShowSearch] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<AccountListWithServer>([]);
  const [showFurtherVerification, setShowFurtherVerification] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const session = useSession();
  const login = useApp((state) => state.login);

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

      <TextField.Root
        style={{
          position: 'relative',
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
    </PageWrapper>
  );
}

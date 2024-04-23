'use client';

import {
  CaretDownIcon,
  CopyIcon,
  PersonIcon,
  ReloadIcon,
} from '@radix-ui/react-icons';
import {
  AlertDialog,
  Button,
  Checkbox,
  DropdownMenu,
  Flex,
  Heading,
  Text,
  TextField,
} from '@radix-ui/themes';
import { debounce } from 'lodash';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import PageWrapper from '../../../components/PageWrapper';
import { UNLOCALIZED_REGION_NAMES } from '../../../constants/regions';
import searchPlayersAcrossRegions, {
  AccountListWithServer,
} from '../../../core/blitz/searchPlayersAcrossRegions';
import { resetSession } from '../../../core/blitzkit/resetSession';
import { setSession } from '../../../core/blitzkit/setSession';
import { useSession } from '../../../stores/session';
import SessionPage from '../../embeds/session/page';
import { Menu } from './components/Menu';
import * as styles from './page.css';

export default function Page() {
  const input = useRef<HTMLInputElement>(null);
  const [searchResults, setSearchResults] = useState<
    AccountListWithServer | undefined
  >(undefined);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const handleChange = debounce(
    async (event: ChangeEvent<HTMLInputElement>) => {
      if (event.target.value) {
        setSearchResults(await searchPlayersAcrossRegions(event.target.value));
      } else {
        setSearchResults(undefined);
        setShowSearchResults(false);
      }
    },
    500,
  );
  const session = useSession();

  useEffect(() => {
    if (session.isTracking) input.current!.value = session.nickname;
  }, [session]);

  return (
    <PageWrapper color="blue">
      <div className={styles.toolBar}>
        <div style={{ flex: 1, boxSizing: 'border-box', position: 'relative' }}>
          <TextField.Root
            defaultValue={session.isTracking ? session.nickname : undefined}
            ref={input}
            onChange={(event) => {
              event.stopPropagation();

              if (event.target.value) {
                setShowSearchResults(true);
                setSearchResults(undefined);
              } else {
                setShowSearchResults(false);
              }

              handleChange(event);
            }}
            onBlur={(event) => {
              // TODO: remove this hack when https://github.com/radix-ui/primitives/issues/2193 (https://github.com/radix-ui/primitives/issues/1969) is fixed
              if (showSearchResults) event.target.focus();
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                setShowSearchResults(false);
                input.current?.blur();
              }
            }}
            placeholder="Search for a player..."
          >
            <TextField.Slot>
              <PersonIcon height="16" width="16" />
            </TextField.Slot>
          </TextField.Root>

          <DropdownMenu.Root open={showSearchResults} modal={false}>
            <DropdownMenu.Trigger>
              <div />
            </DropdownMenu.Trigger>

            <DropdownMenu.Content>
              {searchResults === undefined ? (
                <DropdownMenu.Item disabled>Searching...</DropdownMenu.Item>
              ) : searchResults.length === 0 ? (
                <DropdownMenu.Item disabled>No results</DropdownMenu.Item>
              ) : (
                searchResults?.map(
                  ({ account_id: id, nickname, region }, index) => (
                    <DropdownMenu.Item
                      key={id}
                      onClick={() => {
                        setShowSearchResults(false);
                        setSession(region, id, nickname);
                      }}
                      shortcut={UNLOCALIZED_REGION_NAMES[region]}
                    >
                      {nickname}
                    </DropdownMenu.Item>
                  ),
                )
              )}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <AlertDialog.Root>
            <AlertDialog.Trigger>
              <Button
                variant="soft"
                onClick={(event) => {
                  if (!session.resetPrompt) {
                    event.preventDefault();
                    resetSession();
                  }
                }}
                className={styles.toolbarButton}
                color="red"
              >
                <ReloadIcon width="16" height="16" /> Reset
              </Button>
            </AlertDialog.Trigger>

            <AlertDialog.Content>
              <Flex direction="column" gap="4">
                <Flex direction="column" gap="0">
                  <AlertDialog.Title>
                    Are you sure you want to reset?
                  </AlertDialog.Title>
                  <AlertDialog.Description>
                    This'll discard your current session and start tracking from
                    scratch again.
                  </AlertDialog.Description>
                </Flex>

                <Text size="2">
                  <Checkbox
                    mr="1"
                    onCheckedChange={(checked) =>
                      useSession.setState({
                        resetPrompt: !checked,
                      })
                    }
                  />
                  Don't ask me again
                </Text>
              </Flex>

              <Flex gap="3" mt="4">
                <AlertDialog.Cancel>
                  <Button variant="soft" color="gray">
                    Cancel
                  </Button>
                </AlertDialog.Cancel>

                <AlertDialog.Action>
                  <Button variant="solid" color="red" onClick={resetSession}>
                    Reset
                  </Button>
                </AlertDialog.Action>
              </Flex>
            </AlertDialog.Content>
          </AlertDialog.Root>

          <AlertDialog.Root>
            <AlertDialog.Trigger>
              <Button
                variant="soft"
                className={styles.toolbarButton}
                onClick={(event) => {
                  if (!session.embedPrompt) {
                    event.preventDefault();
                    resetSession();
                  }

                  navigator.clipboard.writeText(
                    `${location.origin}/embeds/session`,
                  );
                }}
              >
                <CopyIcon width="16" height="16" /> Embed
              </Button>
            </AlertDialog.Trigger>

            <AlertDialog.Content>
              <AlertDialog.Title>
                Copied link to your clipboard
              </AlertDialog.Title>
              <AlertDialog.Description>
                Instructions for streamers:
                <iframe
                  style={{
                    width: '100%',
                    aspectRatio: '16 / 9',
                    border: 'none',
                  }}
                  src="https://www.youtube-nocookie.com/embed/e--GwjyrJAE?si=ftEiCmpbMI2FUY5N"
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                ></iframe>
              </AlertDialog.Description>

              <Text size="2">
                <Checkbox
                  mr="1"
                  onCheckedChange={(checked) =>
                    useSession.setState({
                      embedPrompt: !checked,
                    })
                  }
                />
                Don't show this again
              </Text>

              <Flex gap="3" mt="4">
                <AlertDialog.Cancel>
                  <Button variant="soft">Got it!</Button>
                </AlertDialog.Cancel>
              </Flex>
            </AlertDialog.Content>
          </AlertDialog.Root>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant="soft" className={styles.toolbarButton}>
                Options
                <CaretDownIcon />
              </Button>
            </DropdownMenu.Trigger>

            <Menu Builder={DropdownMenu} reset={resetSession} />
          </DropdownMenu.Root>
        </div>
      </div>

      <SessionPage naked={false} />

      {!session.isTracking && (
        <Flex
          align="center"
          justify="center"
          direction="column"
          style={{ flex: 1 }}
        >
          <Heading color="gray">No player selected</Heading>
          <Text color="gray">
            Search for a <PersonIcon /> Player to get started
          </Text>
        </Flex>
      )}
    </PageWrapper>
  );
}

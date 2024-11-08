import {
  searchPlayersAcrossRegions,
  type AccountListItem,
  type AccountListWithServer,
} from '@blitzkit/core';
import strings from '@blitzkit/core/lang/en-US.json';
import { CaretLeftIcon, Link2Icon, PersonIcon } from '@radix-ui/react-icons';
import {
  Badge,
  Button,
  Dialog,
  Flex,
  Heading,
  Spinner,
  Text,
  TextField,
} from '@radix-ui/themes';
import { debounce } from 'lodash-es';
import { useCallback, useRef, useState } from 'react';
import { stringify } from 'urlon';
import type { embedConfigurations } from '../../constants/embeds';
import { EmbedState, type EmbedStateStore } from '../../stores/embedState';
import { CopyButton } from '../CopyButton';

interface GenerateURLProps {
  embed: keyof typeof embedConfigurations;
}

export function GenerateURL({ embed }: GenerateURLProps) {
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [copyUser, setCopyUser] = useState<AccountListItem | null>(null);
  const embedStateStore = EmbedState.useStore();
  const input = useRef<HTMLInputElement>(null);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<AccountListWithServer>([]);
  const performSearch = useCallback(
    debounce(async () => {
      if (!input.current) return;

      const sanitized = input.current.value.trim();

      if (sanitized.length === 0) {
        setSearching(false);
        return;
      }

      const results = await searchPlayersAcrossRegions(sanitized, 12);

      setSearching(false);
      setResults(results);
    }, 500),
    [],
  );
  const handleChange = useCallback(() => {
    if (!input.current) return;

    const sanitized = input.current.value.trim();

    if (sanitized.length === 0) {
      setSearching(false);
      setResults([]);
    } else {
      setSearching(true);
      performSearch();
    }
  }, []);

  return (
    <>
      <Dialog.Root open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
        <Dialog.Trigger>
          <Button>
            <Link2Icon />
            Generate URL
          </Button>
        </Dialog.Trigger>

        <Dialog.Content width="fit-content">
          <Flex direction="column" gap="1">
            <Heading size="5">Generate URL</Heading>
            <Text color="gray">Search an account to track</Text>
          </Flex>

          <TextField.Root
            mt="4"
            style={{ width: '20rem' }}
            placeholder="Search players..."
            ref={input}
            onChange={handleChange}
          >
            <TextField.Slot>
              <PersonIcon />
            </TextField.Slot>
          </TextField.Root>

          <Flex justify="center" my="6">
            {searching && (
              <Text color="gray">
                <Flex align="center" gap="2">
                  <Spinner /> Searching
                </Flex>
              </Text>
            )}
            {!searching && results.length === 0 && (
              <Text color="gray">No results</Text>
            )}

            {!searching && results.length > 0 && (
              <Flex direction="column" gap="2" width="100%">
                {results.map((result) => (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setCopyUser(result);
                      setCopyDialogOpen(true);
                      setSearchDialogOpen(false);
                    }}
                  >
                    <Flex justify="between" width="100%" gap="2">
                      {result.nickname}
                      <Badge>
                        {strings.common.regions.short[result.region]}
                      </Badge>
                    </Flex>
                  </Button>
                ))}
              </Flex>
            )}
          </Flex>

          <Dialog.Close>
            <Button color="red" variant="outline" style={{ width: '100%' }}>
              Cancel
            </Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Root>

      <Dialog.Root open={copyDialogOpen} onOpenChange={setCopyDialogOpen}>
        <Dialog.Content style={{ width: 'fit-content' }}>
          <Flex direction="column" gap="1">
            <Heading size="5">Copy URL</Heading>
            <Text color="gray">
              Generated the URL for {copyUser?.nickname}. The embed will start
              tracking as soon as the URL is pasted. Reset at any time by
              right-clicking on PC or long-pressing on mobile and then selecting
              "Reset".
            </Text>
          </Flex>

          <Flex gap="2" mt="4">
            <Button
              style={{ flex: 1 }}
              variant="outline"
              onClick={() => {
                setCopyDialogOpen(false);
                setSearchDialogOpen(true);
              }}
            >
              <CaretLeftIcon /> Back
            </Button>
            <CopyButton
              style={{ flex: 1 }}
              copy={() => {
                if (!copyUser) return;

                const state = embedStateStore.getState();
                const initial = embedStateStore.getInitialState();
                const shallowState: EmbedStateStore = {};

                Object.entries(state).forEach(([key, value]) => {
                  if (value !== initial[key]) {
                    shallowState[key] = value;
                  }
                });

                const searchParams = new URLSearchParams({
                  id: `${copyUser.account_id}`,
                  state: stringify(shallowState),
                });

                setSearchDialogOpen(false);
                setCopyDialogOpen(false);

                return `${location.origin}/tools/embed/${embed}/host?${searchParams.toString()}`;
              }}
            >
              <Link2Icon /> Copy URL
            </CopyButton>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}

import {
  searchPlayersAcrossRegions,
  type AccountListWithServer,
} from '@blitzkit/core';
import strings from '@blitzkit/core/lang/en-US.json';
import { Link2Icon, PersonIcon } from '@radix-ui/react-icons';
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
import type { configurations } from '../../constants/embeds';
import { EmbedState, type EmbedStateStore } from '../../stores/embedState';
import { CopyButton } from '../CopyButton';

interface CopyURLProps {
  embed: keyof typeof configurations;
}

export function CopyURL({ embed }: CopyURLProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
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
    <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
      <Dialog.Trigger>
        <Button>
          <Link2Icon />
          Copy URL
        </Button>
      </Dialog.Trigger>

      <Dialog.Content width="fit-content">
        <Flex direction="column">
          <Heading size="5">Copy URL</Heading>
          <Text>Search an account to track</Text>
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

        <Flex justify="center" mt="4">
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
        </Flex>

        {!searching && results.length > 0 && (
          <Flex justify="center">
            <Flex
              direction="column"
              gap="2"
              mt="4"
              width="fit-content"
              minWidth="75%"
            >
              {results.map((result) => (
                <CopyButton
                  variant="ghost"
                  copy={() => {
                    const state = embedStateStore.getState();
                    const initial = embedStateStore.getInitialState();
                    const shallowState: EmbedStateStore = {};

                    Object.entries(state).forEach(([key, value]) => {
                      if (value !== initial[key]) {
                        shallowState[key] = value;
                      }
                    });

                    const searchParams = new URLSearchParams({
                      id: `${result.account_id}`,
                      state: stringify(shallowState),
                    });

                    setDialogOpen(false);

                    return `${location.origin}/tools/embed/${embed}/host?${searchParams.toString()}`;
                  }}
                >
                  <Flex justify="between" width="100%" gap="2">
                    {result.nickname}
                    <Badge>{strings.common.regions.short[result.region]}</Badge>
                  </Flex>
                </CopyButton>
              ))}
            </Flex>
          </Flex>
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
}

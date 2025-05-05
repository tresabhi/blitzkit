import {
  SEARCH_KEYS,
  TankDefinition,
  TIER_ROMAN_NUMERALS,
} from '@blitzkit/core';
import { MagnifyingGlassIcon, PaperPlaneIcon } from '@radix-ui/react-icons';
import {
  Box,
  Button,
  Card,
  Flex,
  Spinner,
  Text,
  TextField,
} from '@radix-ui/themes';
import fuzzysort from 'fuzzysort';
import { debounce } from 'lodash-es';
import { useCallback, useRef, useState } from 'react';
import { classIcons } from '../../../../../components/ClassIcon';
import { SearchResults } from '../../../../../components/SearchResults';
import { awaitableTankDefinitions } from '../../../../../core/awaitables/tankDefinitions';
import { awaitableTankNames } from '../../../../../core/awaitables/tankNames';
import { useLocale } from '../../../../../hooks/useLocale';
import { revealEvent } from './GuessRenderer';

const { go } = fuzzysort;

const [tankNames, tankDefinitions] = await Promise.all([
  awaitableTankNames,
  awaitableTankDefinitions,
]);

export function Guesser() {
  const { strings, unwrap } = useLocale();
  const input = useRef<HTMLInputElement>(null);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<TankDefinition[] | null>(null);
  const [selected, setSelected] = useState<TankDefinition | null>(null);

  const requestSearch = useCallback(() => {
    setSelected(null);
    setSearching(true);
    search();
  }, []);
  const search = useCallback(
    debounce(() => {
      if (!input.current) return;

      setSearching(false);
      const trimmed = input.current.value.trim();

      if (trimmed.length === 0) {
        setResults(null);
        return;
      }

      const searchResults = go(trimmed, tankNames, {
        keys: SEARCH_KEYS,
        limit: 6,
      });

      setResults(
        searchResults.map((result) => tankDefinitions.tanks[result.obj.id]),
      );
    }, 500),
    [],
  );

  return (
    <Flex
      direction="column"
      position="absolute"
      bottom="0"
      left="50%"
      style={{ transform: 'translateX(-50%)' }}
      width="100%"
      p="4"
      maxWidth="25rem"
      gap="4"
    >
      {results !== null && (
        <Card variant="classic">
          <Box py="2" px="3">
            {results.length === 0 && (
              <Flex justify="center">
                <Text color="gray">
                  {strings.website.tools.guess.search.no_results}
                </Text>
              </Flex>
            )}

            <SearchResults.Root>
              {results.map((result) => {
                const Icon = classIcons[result.class];

                return (
                  <SearchResults.Item
                    onClick={() => {
                      if (!input.current) return;

                      input.current.value = unwrap(result.name);
                      setSelected(result);
                      setResults(null);
                    }}
                    text={unwrap(result.name)}
                    discriminator={
                      <Flex
                        align="center"
                        gap="1"
                        width="38px"
                        justify="center"
                      >
                        <Icon width="1em" height="1em" />
                        {TIER_ROMAN_NUMERALS[result.tier]}
                      </Flex>
                    }
                  />
                );
              })}
            </SearchResults.Root>
          </Box>
        </Card>
      )}

      <Flex gap="3">
        <TextField.Root
          ref={input}
          onChange={requestSearch}
          style={{ flex: 1 }}
          placeholder={strings.website.tools.guess.search.placeholder}
          size="3"
          variant="classic"
        >
          <TextField.Slot>
            {searching ? <Spinner /> : <MagnifyingGlassIcon />}
          </TextField.Slot>
        </TextField.Root>

        <Button
          size="3"
          disabled={selected === null}
          onClick={() => {
            revealEvent.dispatch(true);
          }}
        >
          {strings.website.tools.guess.search.button} <PaperPlaneIcon />
        </Button>
      </Flex>
    </Flex>
  );
}

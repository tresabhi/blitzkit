'use client';

import { ArrowDownIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { Button, Card, Flex, Text, TextField } from '@radix-ui/themes';
import { useRef, useState } from 'react';
import { Link } from '../../../components/Link';
import PageWrapper from '../../../components/PageWrapper';
import { UNLOCALIZED_REGION_NAMES_SHORT } from '../../../constants/regions';
import searchPlayersAcrossRegions, {
  AccountListWithServer,
} from '../../../core/blitz/searchPlayersAcrossRegions';

export default function Page() {
  const input = useRef<HTMLInputElement>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<AccountListWithServer>([]);

  async function search() {
    if (!input.current) return;

    setSearchResults(await searchPlayersAcrossRegions(input.current.value, 9));
    setSearching(false);
  }

  return (
    <PageWrapper>
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
                    <Link
                      key={player.account_id}
                      href={`/tools/player-stats/${player.account_id}`}
                    >
                      <Button key={player.account_id} variant="ghost">
                        {player.nickname} (
                        {UNLOCALIZED_REGION_NAMES_SHORT[player.region]})
                      </Button>
                    </Link>
                  ))}
                </Flex>
              )}
            </Card>
          )}
        </TextField.Root>
      </Flex>
    </PageWrapper>
  );
}

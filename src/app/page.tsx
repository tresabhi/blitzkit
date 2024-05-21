'use client';

import { CaretRightIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import {
  Button,
  Card,
  Flex,
  Heading,
  Spinner,
  Text,
  TextField,
} from '@radix-ui/themes';
import { go } from 'fuzzysort';
import { debounce } from 'lodash';
import { useRef, useState } from 'react';
import { Link } from '../components/Link';
import { NAVBAR_HEIGHT } from '../components/Navbar';
import PageWrapper from '../components/PageWrapper';
import searchPlayersAcrossRegions, {
  AccountListWithServer,
} from '../core/blitz/searchPlayersAcrossRegions';
import {
  TankDefinition,
  tankDefinitions,
  tankNames,
} from '../core/blitzkit/tankDefinitions';
import { tankIcon } from '../core/blitzkit/tankIcon';
import { theme } from '../stitches.config';

export default function Page() {
  const [showSearch, setShowSearch] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<null | {
    tanks: TankDefinition[];
    players: AccountListWithServer;
  }>();
  const search = useRef<HTMLInputElement>(null);

  const performSearch = debounce(async () => {
    if (!search.current) return;

    const sanitized = search.current.value.trim();
    const awaitedTankDefinitions = await tankDefinitions;
    const awaitedTankNames = await tankNames;
    const tanks = go(sanitized, awaitedTankNames, {
      keys: ['combined'],
      limit: 9,
    });
    const players = await searchPlayersAcrossRegions(sanitized, 9);

    setSearchResults({
      tanks: tanks.map((tank) => awaitedTankDefinitions[tank.obj.id]),
      players,
    });
    setSearching(false);
  }, 500);

  return (
    <>
      <Flex
        align="center"
        justify="center"
        style={{
          height: `calc(75vh - ${NAVBAR_HEIGHT}px)`,
          minHeight: 320,
          position: 'relative',
        }}
        p="4"
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'url(/assets/banners/home.webp)',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'bottom',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: `linear-gradient(${theme.colors.appBackground1}80, ${theme.colors.appBackground1}ff)`,
          }}
        />

        <Flex
          direction="column"
          gap="4"
          align="center"
          justify="center"
          style={{ position: 'relative', width: '100%' }}
        >
          <Flex direction="column" align="center">
            <Heading size="9" weight="bold" align="center">
              BlitzKit
            </Heading>
            <Text color="gray" align="center">
              Everything World of Tanks Blitz
            </Text>
          </Flex>

          <div
            style={{
              maxWidth: '100%',
              position: 'relative',
              width: showSearch ? 640 : 320,
              transition: 'width 0.2s ease',
            }}
          >
            <TextField.Root
              size="3"
              placeholder="Search players or tanks..."
              style={{
                width: '100%',
              }}
              ref={search}
              onChange={() => {
                if (!search.current) return;

                const sanitized = search.current.value.trim();

                if (sanitized.length > 0) {
                  setShowSearch(true);
                  setSearching(true);
                  performSearch();
                } else {
                  setShowSearch(false);
                }
              }}
              onFocus={() => {
                if (!search.current) return;

                const sanitized = search.current.value.trim();

                setShowSearch(sanitized.length > 0);
              }}
            >
              <TextField.Slot>
                <MagnifyingGlassIcon />
              </TextField.Slot>
            </TextField.Root>

            {showSearch && (
              <Card
                mt="3"
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '100%',
                }}
              >
                {searching && (
                  <Flex justify="center">
                    <Spinner />
                  </Flex>
                )}

                {!searching && searchResults && (
                  <>
                    <Flex gap="6">
                      <Flex direction="column" gap="2" style={{ flex: 1 }}>
                        <Link
                          underline="hover"
                          color="gray"
                          href="/tools/tankopedia"
                        >
                          <Flex align="center">
                            Tankopedia
                            <CaretRightIcon />
                          </Flex>
                        </Link>

                        <Flex direction="column" px="2">
                          {searchResults.tanks.map((tank) => (
                            <Text>
                              <Link
                                underline="none"
                                style={{ color: 'inherit' }}
                                href={`/tools/tankopedia/${tank.id}`}
                              >
                                <Button
                                  size="2"
                                  variant="ghost"
                                  color="gray"
                                  style={{
                                    justifyContent: 'flex-start',
                                    width: '100%',
                                    color: 'inherit',
                                  }}
                                >
                                  <Flex align="center" gap="2">
                                    <img
                                      src={tankIcon(tank.id, 'small')}
                                      style={{
                                        height: 16,
                                        width: 32,
                                        objectFit: 'contain',
                                        objectPosition: 'left',
                                      }}
                                    />

                                    {tank.name}
                                  </Flex>
                                </Button>
                              </Link>
                            </Text>
                          ))}
                        </Flex>
                      </Flex>

                      <Flex direction="column" gap="2" style={{ flex: 1 }}>
                        <Text color="gray">Players</Text>

                        <Flex direction="column">
                          {searchResults.players.map((player) => (
                            <Link href={`/`} size="2">
                              {player.nickname}
                            </Link>
                          ))}
                        </Flex>
                      </Flex>
                    </Flex>
                  </>
                )}
              </Card>
            )}
          </div>
        </Flex>
      </Flex>

      <PageWrapper noFlex1>
        hello there! ignore my existence pretty please :&#41;
      </PageWrapper>

      <div style={{ flex: 1 }} />
    </>
  );
}

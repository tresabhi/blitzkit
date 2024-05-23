'use client';

import {
  CaretRightIcon,
  Cross2Icon,
  MagnifyingGlassIcon,
} from '@radix-ui/react-icons';
import {
  Button,
  Card,
  Flex,
  Heading,
  IconButton,
  Link,
  Spinner,
  Text,
  TextField,
} from '@radix-ui/themes';
import { go } from 'fuzzysort';
import { debounce } from 'lodash';
import { useRef, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { NAVBAR_HEIGHT } from '../../components/Navbar';
import { UNLOCALIZED_REGION_NAMES_SHORT } from '../../constants/regions';
import searchPlayersAcrossRegions, {
  AccountListWithServer,
} from '../../core/blitz/searchPlayersAcrossRegions';
import {
  TankDefinition,
  tankDefinitions,
  tankNames,
} from '../../core/blitzkit/tankDefinitions';
import { TIER_ROMAN_NUMERALS } from '../../core/blitzkit/tankDefinitions/constants';
import { useWideFormat } from '../../hooks/useWideFormat';
import { theme } from '../../stitches.config';

const DISCRIMINATOR_WIDTH = 32;

export function Hero() {
  const wideFormat = useWideFormat(512);
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
      limit: 6,
    });
    const players = await searchPlayersAcrossRegions(sanitized, 6);

    setSearchResults({
      tanks: tanks.map((tank) => awaitedTankDefinitions[tank.obj.id]),
      players,
    });
    setSearching(false);
  }, 500);

  return (
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
          backgroundPosition: 'center',
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
              if (!search.current || !isMobile) return;

              const sanitized = search.current.value.trim();
              setShowSearch(sanitized.length > 0);

              window.scrollTo({
                top:
                  search.current.getBoundingClientRect().top -
                  NAVBAR_HEIGHT -
                  32,
                behavior: 'smooth',
              });
            }}
          >
            <TextField.Slot>
              <MagnifyingGlassIcon />
            </TextField.Slot>

            {showSearch && (
              <TextField.Slot>
                <IconButton
                  variant="ghost"
                  color="gray"
                  onClick={() => {
                    if (!search.current) return;

                    search.current.value = '';
                    setShowSearch(false);
                  }}
                >
                  <Cross2Icon />
                </IconButton>
              </TextField.Slot>
            )}
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
                  <Flex
                    gap={wideFormat ? '6' : '2'}
                    justify="center"
                    direction={wideFormat ? 'row' : 'column'}
                  >
                    <Flex
                      direction="column"
                      gap="2"
                      style={{
                        flex: 1,
                        maxWidth: wideFormat ? '50%' : undefined,
                      }}
                    >
                      <Link
                        underline="hover"
                        href="/tools/tankopedia"
                        color="gray"
                        style={{
                          width: '100%',
                        }}
                      >
                        <Flex
                          align="center"
                          style={{
                            width: '100%',
                          }}
                        >
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
                                tabIndex={-1}
                                size="2"
                                variant="ghost"
                                color="gray"
                                style={{
                                  justifyContent: 'flex-start',
                                  width: '100%',
                                  color: 'inherit',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                <Flex align="center" gap="2">
                                  <Text
                                    color="gray"
                                    size="1"
                                    style={{
                                      width: DISCRIMINATOR_WIDTH,
                                      textAlign: 'left',
                                    }}
                                  >
                                    {TIER_ROMAN_NUMERALS[tank.tier]}
                                  </Text>

                                  {tank.name}
                                </Flex>
                              </Button>
                            </Link>
                          </Text>
                        ))}

                        {searchResults.tanks.length === 0 && (
                          <Text color="gray" size="2">
                            No tanks found
                          </Text>
                        )}
                      </Flex>
                    </Flex>

                    <Flex
                      direction="column"
                      gap="2"
                      style={{
                        flex: 1,
                        maxWidth: wideFormat ? '50%' : undefined,
                      }}
                    >
                      <Text color="gray">Players</Text>

                      <Flex direction="column">
                        {searchResults.players.map((player) => (
                          <Text>
                            <Link
                              underline="none"
                              style={{ color: 'inherit' }}
                              href={`/tools/session/?id=${player.account_id}`}
                            >
                              <Button
                                tabIndex={-1}
                                size="2"
                                variant="ghost"
                                color="gray"
                                style={{
                                  justifyContent: 'flex-start',
                                  width: '100%',
                                  color: 'inherit',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                <Flex align="center" gap="2">
                                  <Text
                                    color="gray"
                                    size="1"
                                    style={{
                                      width: DISCRIMINATOR_WIDTH,
                                      textAlign: 'left',
                                    }}
                                  >
                                    {
                                      UNLOCALIZED_REGION_NAMES_SHORT[
                                        player.region
                                      ]
                                    }
                                  </Text>

                                  {player.nickname}
                                </Flex>
                              </Button>
                            </Link>
                          </Text>
                        ))}

                        {searchResults.players.length === 0 && (
                          <Text color="gray" size="2">
                            No players found
                          </Text>
                        )}
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
  );
}

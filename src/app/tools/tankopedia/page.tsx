'use client';

import { slateDark } from '@radix-ui/colors';
import { CaretDownIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import {
  Button,
  Card,
  DropdownMenu,
  Flex,
  Inset,
  Text,
  TextField,
} from '@radix-ui/themes';
import { go } from 'fuzzysort';
import Link from 'next/link';
import { Suspense, use, useEffect, useMemo, useRef, useState } from 'react';
import PageWrapper from '../../../components/PageWrapper';
import { asset } from '../../../core/blitzkrieg/asset';
import {
  TANK_ICONS,
  TANK_ICONS_COLLECTOR,
  TANK_ICONS_PREMIUM,
  TIER_ROMAN_NUMERALS,
  TankDefinition,
  tanksDefinitionsArray,
} from '../../../core/blitzkrieg/tankDefinitions';
import { tankIcon } from '../../../core/blitzkrieg/tankIcon';
import { theme } from '../../../stitches.config';
import mutateTankopedia, {
  TankopediaSortBy,
  TankopediaSortDirection,
  useTankopedia,
} from '../../../stores/tankopedia';
import { Options } from './components/Options';
import { PageTurner } from './components/PageTurner';
import * as styles from './page.css';

const TANKS_PER_PAGE = 3 * 2 ** 3;

export default function Page() {
  const filters = useTankopedia((state) => state.filters);
  const sort = useTankopedia((state) => state.sort);
  const awaitedTanks = use(tanksDefinitionsArray);
  const input = useRef<HTMLInputElement>(null);
  const searchableTanks = useMemo(
    () =>
      awaitedTanks
        .filter(
          (tank) =>
            (filters.tiers.length === 0
              ? true
              : filters.tiers.includes(tank.tier)) &&
            (filters.types.length === 0
              ? true
              : filters.types.includes(tank.type)) &&
            (filters.treeTypes.length === 0
              ? true
              : filters.treeTypes.includes(tank.tree_type)) &&
            (filters.nations.length === 0
              ? true
              : filters.nations.includes(tank.nation)) &&
            (filters.test === 'include'
              ? true
              : filters.test === 'exclude'
                ? !tank.testing
                : tank.testing),
        )
        .sort((a, b) => {
          let diff = 0;

          if (sort.by === 'tier') {
            diff = a.tier - b.tier;
          }
          if (sort.by === 'name') {
            diff = a.name.localeCompare(b.name);
          }

          return sort.direction === 'ascending' ? diff : -diff;
        }),
    [filters, sort],
  );
  const [searchedList, setSearchedList] = useState(searchableTanks);
  const [page, setPage] = useState(0);

  useEffect(() => {
    setSearchedList(searchableTanks);
    if (input.current) input.current.value = '';
  }, [searchableTanks]);

  useEffect(() => {
    setPage(
      Math.min(
        Math.max(0, page),
        Math.ceil(searchedList.length / TANKS_PER_PAGE) - 1,
      ),
    );
  }, [searchedList]);

  return (
    <PageWrapper size="wide" color="purple">
      <Suspense fallback={<Text>Loading...</Text>}>
        <Flex direction="column" gap="4">
          <Flex gap="2">
            <TextField.Root style={{ flex: 1 }}>
              <TextField.Slot>
                <MagnifyingGlassIcon height="16" width="16" />
              </TextField.Slot>
              <TextField.Input
                ref={input}
                placeholder="Search tanks..."
                onChange={(event) => {
                  if (event.target.value.length === 0) {
                    setSearchedList(searchableTanks);
                  } else {
                    setSearchedList(
                      go(event.target.value, searchableTanks, {
                        keys: ['name', 'id'] satisfies (keyof TankDefinition)[],
                      }).map(({ obj }) => obj),
                    );
                  }
                }}
              />
            </TextField.Root>

            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <Button variant="soft">
                  Sort
                  <CaretDownIcon />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                <DropdownMenu.Label>By</DropdownMenu.Label>
                <DropdownMenu.RadioGroup
                  value={sort.by}
                  onValueChange={(value) =>
                    mutateTankopedia((draft) => {
                      draft.sort.by = value as TankopediaSortBy;
                    })
                  }
                >
                  <DropdownMenu.RadioItem value="tier">
                    Tier
                  </DropdownMenu.RadioItem>
                  <DropdownMenu.RadioItem value="name">
                    Name
                  </DropdownMenu.RadioItem>
                </DropdownMenu.RadioGroup>

                <DropdownMenu.Separator />

                <DropdownMenu.Label>Direction</DropdownMenu.Label>
                <DropdownMenu.RadioGroup
                  value={sort.direction}
                  onValueChange={(value) =>
                    mutateTankopedia((draft) => {
                      draft.sort.direction = value as TankopediaSortDirection;
                    })
                  }
                >
                  <DropdownMenu.RadioItem value="ascending">
                    Ascending
                  </DropdownMenu.RadioItem>
                  <DropdownMenu.RadioItem value="descending">
                    Descending
                  </DropdownMenu.RadioItem>
                </DropdownMenu.RadioGroup>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </Flex>

          <Card>
            <Suspense fallback={<Text>Loading...</Text>}>
              <Options />
            </Suspense>
          </Card>
        </Flex>

        <PageTurner
          page={page}
          setPage={setPage}
          tanksPerPage={TANKS_PER_PAGE}
          searchedList={searchedList}
        />

        <Flex wrap="wrap" gap="3" justify="center">
          {searchedList
            .map((tank) => (
              <Link
                key={tank.id}
                href={`/tools/tankopedia/${tank.id}`}
                style={{
                  flex: 1,
                  textDecoration: 'none',
                  color: 'unset',
                }}
              >
                <Card className={styles.listing}>
                  <Inset
                    key={tank.id}
                    style={{
                      minWidth: 256,
                      minHeight: 128,
                      position: 'relative',
                      display: 'flex',
                    }}
                  >
                    <img
                      className={styles.flag}
                      src={asset(`flags/scratched/${tank.nation}.webp`)}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        position: 'absolute',
                      }}
                    />

                    <div
                      style={{
                        width: 256,
                        height: 128,
                      }}
                      className={styles.listingImage}
                    >
                      <img
                        src={tankIcon(tank.id)}
                        style={{
                          objectFit: 'contain',
                          objectPosition: 'left center',
                        }}
                      />
                    </div>

                    <div
                      className={styles.listingShadow}
                      style={{
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                        transition: `box-shadow ${theme.durations.regular}`,
                      }}
                    />

                    <Flex
                      align="center"
                      justify="between"
                      className={styles.listingLabel}
                      style={{
                        position: 'absolute',
                        bottom: 8,
                        padding: '0 12px',
                        width: '100%',
                        boxSizing: 'border-box',
                      }}
                    >
                      <Flex align="center" justify="center" gap="1">
                        <img
                          src={
                            (tank.tree_type === 'collector'
                              ? TANK_ICONS_COLLECTOR
                              : tank.tree_type === 'premium'
                                ? TANK_ICONS_PREMIUM
                                : TANK_ICONS)[tank.type]
                          }
                          style={{ width: '1em', height: '1em' }}
                        />
                        <Text
                          size="4"
                          color={
                            tank.tree_type === 'collector'
                              ? 'blue'
                              : tank.tree_type === 'premium'
                                ? 'amber'
                                : undefined
                          }
                          weight="medium"
                          style={{
                            color:
                              tank.tree_type === 'researchable'
                                ? slateDark.slate12
                                : undefined,
                            whiteSpace: 'nowrap',
                            maxWidth: 160,
                            display: 'block',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                          }}
                        >
                          {tank.name}
                        </Text>
                      </Flex>

                      <Text size="4" color="gray" highContrast={false}>
                        {TIER_ROMAN_NUMERALS[tank.tier]}
                      </Text>
                    </Flex>
                  </Inset>
                </Card>
              </Link>
            ))
            .slice(page * TANKS_PER_PAGE, (page + 1) * TANKS_PER_PAGE)}
        </Flex>

        <PageTurner
          page={page}
          setPage={setPage}
          tanksPerPage={TANKS_PER_PAGE}
          searchedList={searchedList}
        />
      </Suspense>
    </PageWrapper>
  );
}

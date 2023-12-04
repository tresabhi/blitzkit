'use client';

import { slateDark } from '@radix-ui/colors';
import {
  CaretLeftIcon,
  CaretRightIcon,
  MagnifyingGlassIcon,
} from '@radix-ui/react-icons';
import { Button, Card, Flex, Inset, Text, TextField } from '@radix-ui/themes';
import { go } from 'fuzzysort';
import { Suspense, use, useEffect, useMemo, useRef, useState } from 'react';
import PageWrapper from '../../../components/PageWrapper';
import { tankIcon } from '../../../core/blitzkrieg/tankIcon';
import {
  BlitzkriegTankopediaEntry,
  TANK_ICONS,
  TANK_ICONS_COLLECTOR,
  TANK_ICONS_PREMIUM,
  tanks,
} from '../../../core/blitzkrieg/tankopedia';
import { theme } from '../../../stitches.config';
import { useTankopedia } from '../../../stores/tankopedia';
import { Options } from './components/Options';
import * as styles from './page.css';

const flags = [
  'https://i.imgur.com/Iho9ATV.png',
  'https://i.imgur.com/uKWdnOn.png',
  'https://i.imgur.com/kf4GwjJ.png',
];

const TANKS_PER_PAGE = 30;

export default function Page() {
  const tankopediaState = useTankopedia();
  const awaitedTanks = use(tanks);
  const input = useRef<HTMLInputElement>(null);
  const sortedTanks = useMemo(
    () =>
      awaitedTanks.sort((a, b) => {
        let diff = 0;
        if (tankopediaState.sortBy === 'tier') diff = a.tier - b.tier;
        return tankopediaState.sortDirection === 'ascending' ? diff : -diff;
      }),
    [tankopediaState.sortBy, tankopediaState.sortDirection],
  );
  const [searchedList, setSearchedList] = useState(sortedTanks);
  const [page, setPage] = useState(0);
  const pageInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (pageInput.current) pageInput.current.value = `${page + 1}`;
  }, [page]);
  useEffect(() => {
    setPage(
      Math.min(
        Math.max(0, page),
        Math.ceil(searchedList.length / TANKS_PER_PAGE) - 1,
      ),
    );
  }, [searchedList]);

  return (
    <PageWrapper size="wide">
      <Suspense fallback={<Text>Loading...</Text>}>
        <Flex direction="column" gap="2">
          <TextField.Root>
            <TextField.Slot>
              <MagnifyingGlassIcon height="16" width="16" />
            </TextField.Slot>
            <TextField.Input
              ref={input}
              placeholder="Search tanks..."
              onChange={(event) => {
                if (event.target.value.length === 0) {
                  setSearchedList(sortedTanks);
                } else {
                  setSearchedList(
                    go(event.target.value, sortedTanks, {
                      keys: [
                        'name',
                        'name_short',
                        'id',
                        'nation',
                        'tree_type',
                        'type',
                      ] satisfies (keyof BlitzkriegTankopediaEntry)[],
                    }).map(({ obj }) => obj),
                  );
                }
              }}
            />
          </TextField.Root>

          <Options />

          <Flex align="center" justify="center" gap="2">
            <Button
              variant="soft"
              disabled={page === 0}
              onClick={() => setPage(Math.max(0, page - 1))}
            >
              <CaretLeftIcon />
            </Button>
            <TextField.Root>
              <TextField.Slot>Page</TextField.Slot>
              <TextField.Input
                defaultValue={1}
                type="number"
                ref={pageInput}
                min={1}
                max={Math.floor(searchedList.length / TANKS_PER_PAGE) + 1}
                style={{ width: 64, textAlign: 'center' }}
                onBlur={(event) => {
                  setPage(
                    Math.max(
                      0,
                      Math.min(
                        Math.floor(searchedList.length / TANKS_PER_PAGE),
                        event.target.valueAsNumber - 1,
                      ),
                    ),
                  );
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    (event.target as HTMLInputElement).blur();
                  }
                }}
              />
              <TextField.Slot>
                out of {Math.floor(searchedList.length / TANKS_PER_PAGE) + 1}
              </TextField.Slot>
            </TextField.Root>
            <Button
              variant="soft"
              disabled={
                Math.floor(searchedList.length / TANKS_PER_PAGE) === page
              }
              onClick={() =>
                setPage(
                  Math.min(
                    Math.floor(searchedList.length / TANKS_PER_PAGE),
                    page + 1,
                  ),
                )
              }
            >
              <CaretRightIcon />
            </Button>
          </Flex>
        </Flex>

        <Flex wrap="wrap" gap="3" justify="center">
          {searchedList
            .map((tank) => (
              <a
                href={`/tools/tankopedia/${tank.id}`}
                style={{
                  flex: 1,
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
                      // pick a random flag
                      src={flags[Math.floor(Math.random() * flags.length)]}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        position: 'absolute',
                      }}
                    ></img>

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
                      justify="center"
                      gap="1"
                      className={styles.listingLabel}
                      style={{
                        position: 'absolute',
                        bottom: 8,
                        left: 12,
                      }}
                    >
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
                            tank.tree_type === 'tech-tree'
                              ? slateDark.slate12
                              : undefined,
                        }}
                      >
                        {tank.name_short ??
                          tank.name ??
                          `Unknown tank ${tank.id}`}
                      </Text>
                    </Flex>
                  </Inset>
                </Card>
              </a>
            ))
            .slice(page * TANKS_PER_PAGE, (page + 1) * TANKS_PER_PAGE)}
        </Flex>
      </Suspense>
    </PageWrapper>
  );
}

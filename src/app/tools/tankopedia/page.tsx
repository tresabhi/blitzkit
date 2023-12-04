'use client';

import { slateDark } from '@radix-ui/colors';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { Card, Flex, Inset, Text, TextField } from '@radix-ui/themes';
import { go } from 'fuzzysort';
import { Suspense, use, useEffect, useMemo, useRef, useState } from 'react';
import PageWrapper from '../../../components/PageWrapper';
import { asset } from '../../../core/blitzkrieg/asset';
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
import { PageTurner } from './components/PageTurner';
import * as styles from './page.css';

const TANKS_PER_PAGE = 30;

export default function Page() {
  const tankopediaState = useTankopedia();
  const awaitedTanks = use(tanks);
  const input = useRef<HTMLInputElement>(null);
  const searchableTanks = useMemo(
    () =>
      awaitedTanks
        .filter(
          (tank) =>
            (tankopediaState.filters.tiers.length === 0
              ? true
              : tankopediaState.filters.tiers.includes(tank.tier)) &&
            (tankopediaState.filters.types.length === 0
              ? true
              : tankopediaState.filters.types.includes(tank.type)) &&
            (tankopediaState.filters.treeTypes.length === 0
              ? true
              : tankopediaState.filters.treeTypes.includes(tank.tree_type)),
        )
        .toSorted((a, b) => {
          let diff = 0;

          if (tankopediaState.sort.by === 'tier') {
            diff = a.tier - b.tier;
          }
          if (tankopediaState.sort.by === 'name') {
            diff = (
              a.name_short ??
              a.name ??
              `Unknown tank ${a.id}`
            ).localeCompare(b.name_short ?? b.name ?? `Unknown tank ${b.id}`);
          }

          return tankopediaState.sort.direction === 'ascending' ? diff : -diff;
        }),
    [tankopediaState.filters, tankopediaState.sort],
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
        <Flex direction="column" gap="3">
          <TextField.Root>
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
              <a
                key={tank.id}
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
                    {tank.nation !== 'other' && (
                      <img
                        className={styles.flag}
                        src={asset(`flags/${tank.nation}.webp`)}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          position: 'absolute',
                        }}
                      />
                    )}

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
